const moment = require("moment");
const {
  loadApiCatalog,
  getCatalogMeta,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
  ALLOWED_API_IDS,
  resolveAllowedApi,
} = require("./catalogLoader");
const {
  askOllama,
  extractJsonObject,
  isOllamaUp,
  checkContextBudget,
} = require("./ollamaClient");
const {
  executeApiAction,
  today,
  replaceDateTokens,
  sanitizeRainfallAction,
  sanitizeThresholdAction,
  sanitizeRankingAction,
  sanitizeCompareAction,
  sanitizeDatesFromQuestion,
  applyMonthRangeFromQuestion,
  extractCategoriesFromQuestion,
  isThresholdListQuestion,
  sanitizePlaceLevelAction,
  buildRelatedOptions,
  extractRelatedPlaceContext,
  getDepartureCategory,
} = require("./apiExecutor");
const {
  runPreChatClarifications,
  runPostPlanLocationClarifications,
} = require("./clarification");
const { retrieveForPlanner, formatContext, init: initRag } = require("./rag/retriever");
const { answerKnowledgeQuestion } = require("./rag/knowledge");
const { route: routeQuestion } = require("./rag/router");
const { getIndexMeta } = require("./rag/indexStore");

const RAG_ENABLED = String(process.env.RAG_ENABLED ?? "true").toLowerCase() !== "false";

/**
 * @param {string} catalogMarkdown  either the retrieved sections (RAG) or, when
 *                                  retrieval is off/unavailable, the whole catalog.
 * @param {boolean} retrieved       true when the text is a retrieved subset.
 */
function buildPlannerSystemPrompt(catalogMarkdown, { retrieved = false } = {}) {
  const catalogHeading = retrieved
    ? `API CATALOG (sections retrieved for THIS question):`
    : `API CATALOG:`;
  return `You are an API planner for IRAINS.
Read the API catalog and map the user question to ONE action.
- Rainfall / rankings / threshold / coverage / AWS-inclusive / range-stats → matching allowed api_id
- Spatial → get_spatial_distribution_data*; Monsoon activity labels → get_monsoon_activity*
- "Where is…" / "Open…" → navigation + product_name + route_path
- CRITICAL: bare "map"/"maps" without a product → navigation with null route, reason "ambiguous_map"
- CRITICAL category rule: Large Excess/Excess/Deficient/Large Deficient/No Rain → fetch_district_data (or state) + post_process.filter_by_departure_category. Never copy example date ranges unless the user said them.
- Compare state A vs B (e.g. "Compare Tamil Nadu vs Kerala in June") → fetch_state_data + post_filter.state_names: [A, B] + month/date range. NEVER monsoon or all-district dumps for compare.
- Heavy rainfall / wettest stations → fetch_station_with_max_rainfall with body.limit (and dates). Prefer the term "Heavy Rainfall" (never "Heaviest Rainfall").
- Named station rainfall → fetch_station_data + post_filter.station_name (show that station only).
- Named district rainfall → fetch_district_data + post_filter.district_name (backend also attaches stations in that district).
- Same date in previous years / historical for a place → fetch_district_data or fetch_station_data with post_process.type same_date_history.
- Threshold above X mm → filter_by_actual_min; no date → LAST_30_START→TODAY day-wise with dates; all-India needs no place.
- Highest rainfall on a date (e.g. 25th July) → fetch_district_data + rank_by_actual. NEVER monsoon.
- IMD+AWS rainfall → fetch_*_data_with_aws; "IMD or AWS mode?" → get_calculations_mode
- Missing stations / MC chase-up → fetch_centre_station_summary or fetch_district_station_count
- Period min/max/avg summary → fetch_*_range_statistics
- Monsoon Weak/Active/Vigorous/Subdued ONLY when user asks monsoon activity — not for highest rainfall
Return ONLY valid JSON matching the catalog contract.
Use date tokens TODAY, YESTERDAY, LAST_7_START, LAST_30_START, SEASON_START when appropriate.
CRITICAL date rule: whole month without a day → 1st to last day of that month. Never only the 1st.
Do not invent endpoints or api_id values.
api_id MUST be exactly one of: ${ALLOWED_API_IDS.join(", ")}
Do not include markdown.

Current server date: ${today()}

${catalogHeading}
${catalogMarkdown}`;
}

/**
 * Planner context for one question.
 *
 * Retrieval replaced whole-catalog stuffing: the full catalog is ~9,200 tokens
 * and, with Ollama's old 2048 default window, ~82% of it was silently dropped
 * before the model read a word. Retrieved context is ~2,500-3,500 tokens, fits
 * any sane window, and carries the sections this question actually needs.
 * Falls back to the full catalog when RAG is disabled or the index is missing.
 */
async function buildPlannerContext(question) {
  if (!RAG_ENABLED) {
    return { text: loadApiCatalog(), retrieved: false, reason: "RAG_ENABLED=false" };
  }
  try {
    const result = await retrieveForPlanner(question);
    const text = formatContext(result);
    if (!text || !result.chunks.length) {
      return { text: loadApiCatalog(), retrieved: false, reason: "empty retrieval" };
    }
    return {
      text,
      retrieved: true,
      chunks: result.chunks.map((c) => ({
        heading: c.heading,
        type: c.type,
        score: c.score,
      })),
      tokens: Math.ceil(text.length / 4),
      timings: result.timings,
    };
  } catch (err) {
    console.warn("[rag] planner retrieval failed, using full catalog:", err.message);
    return { text: loadApiCatalog(), retrieved: false, reason: err.message };
  }
}

/**
 * Heal hallucinated api_id when path/method still match an allowlisted API.
 */
function normalizeApiAction(action) {
  if (!action || typeof action !== "object") return action;
  const resolved = resolveAllowedApi(action);
  if (resolved && resolved.apiId !== action.api_id) {
    action.api_id = resolved.apiId;
    action.method = resolved.allowed.method;
    if (resolved.allowed.path != null) action.path = resolved.allowed.path;
  }
  return action;
}

function buildAnswerSystemPrompt({ didYouMean = null } = {}) {
  const didYouMeanRule = didYouMean
    ? `\nCRITICAL: Start the answer with exactly: "${didYouMean.prompt}" then give the rainfall data for ${didYouMean.to}. Never pretend the user typed ${didYouMean.to} correctly.`
    : "";
  return `You are Varsha, IRAINS rainfall assistant.
Answer using ONLY the provided API JSON data.
Be concise.
Include actual mm, normal mm, and departure % when present.
CRITICAL UNITS: actual and normal are in millimetres (mm). Departure is a PERCENTAGE (%) — never write departure with "mm".
Round rainfall to 1 decimal place. Never print a raw float like 7.238679956847527.
When startDate and endDate differ, say the full range (e.g. "from 2026-06-01 to 2026-06-30"), never a single day.
Use meteorological term "Heavy Rainfall" — never say "Heaviest Rainfall".
CRITICAL LEVEL NAMING: name places by the field they came from — rows with district_name are DISTRICTS, state_name are STATES, subdiv_name are SUBDIVISIONS, station_name are STATIONS. Never call a district a station, or a state a district.
For rankings (top wettest / highest / heavy rainfall), list places with actual mm in order, and say which level they are (e.g. "top 5 districts").
For a named district, state the district rainfall first, then list station rainfall values in that district when present in api_data_sample (_level station rows).
For a named station, state only that station’s rainfall.
For threshold questions (above X mm), list matching places with actual mm AND the date of each row.
For same_date_history, list each year’s rainfall for that calendar date.
For spatial distribution, state the category (Isolated / Scattered / Fairly Widespread / Widespread) and percentage when present.
For monsoon activity, state Weak / Normal / Active / Vigorous / Subdued clearly with the place name.
For navigation results, reply with the product name and route path clearly (e.g. "Open: Product Name → /route").
If comparing multiple areas, summarize each side-by-side.
If the user asked for a departure category (Large Excess, Excess, Deficient, Large Deficient, Normal, No Rain) and api_data_sample is empty, say that place/date was NOT in that category — do NOT say "data is not available".
If category_miss is present, rainfall data EXISTS: say they asked for category_miss.wanted (or the asked category) but the place was category_miss.category with that departure %. Never claim data is missing when category_miss is present.
Only say data is not available when api_data_sample is empty AND category_miss is null/absent.
Do not invent numbers.${didYouMeanRule}`;
}

function formatNavigationAnswer(action, apiResult) {
  const row = Array.isArray(apiResult.data) ? apiResult.data[0] : null;
  const name = row?.product_name || action.product_name;
  const route = row?.route_path || action.route_path;
  if (!route) {
    return "I could not find that product in the IRAINS menu catalog. Please rephrase or check All Maps Overview.";
  }
  return `${name} is available at ${route}.`;
}

function formatFallbackAnswer(question, action, apiResult) {
  if (action?.module === "navigation" || action?.api_id === "resolve_product_route") {
    return formatNavigationAnswer(action, apiResult);
  }

  const rows = Array.isArray(apiResult.data) ? apiResult.data : [];
  if (!apiResult.ok) {
    return `API call failed (${apiResult.status}). Please try again.`;
  }

  const notePrefix = apiResult.note ? `${apiResult.note} ` : "";
  const used = apiResult.usedDate || null;
  const start = action?.body?.startDate || today();
  const end = action?.body?.endDate || start;
  const dateText = used
    ? used
    : start === end
      ? start
      : `${start} to ${end}`;

  if (action?.post_process?.type === "filter_by_departure_category") {
    const cats = (action.post_process.categories || []).join(" / ");
    if (!rows.length) {
      const place =
        action?.post_filter?.district_name ||
        action?.post_filter?.state_name ||
        (Array.isArray(action?.post_filter?.state_names)
          ? action.post_filter.state_names.join(", ")
          : null) ||
        apiResult.category_miss?.name ||
        "the selected area";
      if (apiResult.category_miss) {
        const miss = apiResult.category_miss;
        const dep =
          miss.departure != null
            ? ` (departure ${miss.departure > 0 ? "+" : ""}${Number(
                miss.departure
              ).toFixed(1)}%)`
            : "";
        return (
          `${notePrefix}${place} was not in ${cats} for ${dateText}. ` +
          `It was ${miss.category}${dep}. ` +
          `Rainfall data is available — it just was not ${cats}.`
        );
      }
      return `${notePrefix}No ${cats} for ${place} on ${dateText}. Rainfall data for this place/date was not found.`;
    }
    const sample = rows
      .slice(0, 8)
      .map((r) => {
        const name =
          r.district_name || r.state_name || r.subdiv_name || r.name || "Area";
        return `${name} (${Number(r.departure).toFixed(1)}%, ${r.category})`;
      })
      .join("; ");
    return `${notePrefix}For ${dateText}, found ${rows.length} area(s) in ${cats}. Examples: ${sample}.`;
  }

  if (action?.post_process?.type === "rank_by_actual") {
    if (!rows.length) {
      return `${notePrefix}No ranking data available for ${dateText}.`;
    }
    const limit = action.post_process.limit || rows.length;
    const list = rows
      .slice(0, limit)
      .map((r, i) => {
        const name =
          r.district_name ||
          r.state_name ||
          r.subdiv_name ||
          r.subdivision_name ||
          r.block_name ||
          r.region_name ||
          r.station_name ||
          r.name ||
          "Area";
        const actual = Number(
          r.actual ?? r.actual_rainfall ?? r.rainfall ?? r.avg_actual ?? 0
        );
        return `${i + 1}. ${name} (${actual.toFixed(1)} mm)`;
      })
      .join("; ");
    return `${notePrefix}Heavy Rainfall / top wettest for ${dateText}: ${list}.`;
  }

  if (action?.post_process?.type === "same_date_history") {
    if (!rows.length) {
      return `${notePrefix}No historical same-date rainfall found.`;
    }
    const list = rows
      .map((r) => {
        const label = r.year || r.date || "";
        const actual = r.actual ?? r.actual_rainfall;
        const name =
          r.station_name || r.district_name || r.name || "Place";
        return actual == null
          ? `${label}: ${name} (no data)`
          : `${label}: ${name} (${Number(actual).toFixed(1)} mm)`;
      })
      .join("; ");
    return `${notePrefix}Same-date history: ${list}.`;
  }

  // District + stations payload
  const districtRows = rows.filter((r) => r._level === "district");
  const stationRows = rows.filter((r) => r._level === "station");
  if (districtRows.length === 1 && stationRows.length) {
    const d = districtRows[0];
    const dName = d.district_name || d.name || "District";
    const dActual = Number(
      d.actual ?? d.actual_rainfall ?? d.rainfall ?? NaN
    );
    const dNormal = Number(d.normal ?? d.normal_rainfall ?? NaN);
    const dDep = Number(d.departure ?? NaN);
    const bits = [
      Number.isFinite(dActual) ? `actual ${dActual.toFixed(1)} mm` : null,
      Number.isFinite(dNormal) ? `normal ${dNormal.toFixed(1)} mm` : null,
      Number.isFinite(dDep)
        ? `departure ${dDep > 0 ? "+" : ""}${dDep.toFixed(1)}%`
        : null,
    ].filter(Boolean);
    const stations = stationRows
      .slice(0, 40)
      .map((s) => {
        const sn = s.station_name || s.name || "Station";
        const a = Number(s.actual ?? s.actual_rainfall ?? s.data ?? NaN);
        return Number.isFinite(a)
          ? `${sn} (${a.toFixed(1)} mm)`
          : `${sn} (n/a)`;
      })
      .join("; ");
    return (
      `${notePrefix}${dName} district for ${dateText}` +
      (bits.length ? `: ${bits.join(", ")}.` : ".") +
      ` Stations (${stationRows.length}): ${stations}.`
    );
  }

  if (
    action?.api_id === "fetch_station_data" ||
    (stationRows.length && !districtRows.length)
  ) {
    if (!rows.length) {
      return `${notePrefix}No station rainfall available for ${dateText}.`;
    }
    const list = rows
      .slice(0, 20)
      .map((r) => {
        const sn = r.station_name || r.name || "Station";
        const a = Number(r.actual ?? r.actual_rainfall ?? r.data ?? NaN);
        return Number.isFinite(a)
          ? `${sn} (${a.toFixed(1)} mm)`
          : `${sn} (n/a)`;
      })
      .join("; ");
    return `${notePrefix}Station rainfall for ${dateText}: ${list}.`;
  }

  if (action?.post_process?.type === "filter_by_actual_min") {
    const minMm = action.post_process.min_mm;
    if (!rows.length) {
      return `${notePrefix}No places with rainfall ≥ ${minMm} mm for ${dateText}.`;
    }
    const list = rows
      .slice(0, 20)
      .map((r) => {
        const name =
          r.district_name ||
          r.state_name ||
          r.subdiv_name ||
          r.name ||
          "Area";
        const actual = Number(
          r.actual ?? r.actual_rainfall ?? r.rainfall ?? 0
        );
        const d = r.date ? ` on ${r.date}` : "";
        return `${name}${d} (${actual.toFixed(1)} mm)`;
      })
      .join("; ");
    const more =
      rows.length > 20 ? ` …and ${rows.length - 20} more.` : "";
    return `${notePrefix}Places with ≥ ${minMm} mm (${dateText}): ${list}.${more}`;
  }

  if (
    action?.post_process?.type === "filter_by_monsoon_activity" ||
    String(action?.api_id || "").startsWith("get_monsoon_activity")
  ) {
    if (!rows.length) {
      return `${notePrefix}No monsoon activity rows for ${dateText}.`;
    }
    const list = rows
      .slice(0, 12)
      .map((r) => {
        const name =
          r.name || r.subdiv_name || r.district_name || r.code || "Area";
        if (Array.isArray(r.days) && r.days.length) {
          const recent = r.days
            .slice(-3)
            .map((d) => `${d.date}:${d.activity}`)
            .join(", ");
          return `${name} [${recent}]`;
        }
        return `${name}: ${r.activity || "n/a"} (spatial ${r.spatial || "n/a"})`;
      })
      .join("; ");
    return `${notePrefix}Monsoon activity for ${dateText}: ${list}.`;
  }

  if (
    String(action?.api_id || "").startsWith("get_spatial_distribution") ||
    action?.post_process?.type === "filter_by_spatial_category"
  ) {
    if (!rows.length) {
      return `${notePrefix}No spatial distribution data for ${dateText}.`;
    }
    const list = rows
      .slice(0, 12)
      .map((r) => {
        const name =
          r.subdivision_name ||
          r.subdiv_name ||
          r.state_name ||
          r.name ||
          "Area";
        const pct =
          r.percentage != null ? `${Number(r.percentage).toFixed(1)}%` : "n/a";
        return `${name}: ${r.category || r.spatial || "n/a"} (${pct})`;
      })
      .join("; ");
    return `${notePrefix}Spatial distribution for ${dateText}: ${list}.`;
  }

  if (!rows.length) {
    const date =
      action?.body?.startDate ||
      action?.body?.endDate ||
      today();
    return `No data available for this request on ${date}.`;
  }

  // Compare / multi-row summary (e.g. Tamil Nadu vs Kerala)
  if (rows.length > 1 && (action?.post_filter?.state_names || rows.length <= 5)) {
    const parts = rows.slice(0, 5).map((row) => {
      const name =
        row.state_name ||
        row.district_name ||
        row.subdiv_name ||
        row.name ||
        "Selected area";
      const actual =
        row.actual_state_rainfall ??
        row.actual_rainfall ??
        row.actual_subdiv_rainfall ??
        null;
      const normal = row.rainfall_normal_value ?? row.normal_rainfall ?? null;
      const departure = row.departure ?? null;
      const actualText = actual == null ? "No Data" : `${Number(actual).toFixed(1)} mm`;
      const normalText = normal == null ? "No Data" : `${Number(normal).toFixed(1)} mm`;
      const depText =
        departure == null
          ? "No Data"
          : `${departure > 0 ? "+" : ""}${Number(departure).toFixed(1)}%`;
      return `${name}: actual ${actualText}, normal ${normalText}, departure ${depText}`;
    });
    return `${notePrefix}On ${dateText} — ${parts.join(" | ")}.`;
  }

  const row = rows[0];
  const name =
    row.state_name ||
    row.district_name ||
    row.subdiv_name ||
    row.name ||
    "Selected area";
  const actual =
    row.actual_state_rainfall ??
    row.actual_rainfall ??
    row.actual_subdiv_rainfall ??
    null;
  const normal =
    row.rainfall_normal_value ??
    row.normal_rainfall ??
    null;
  const departure = row.departure ?? null;
  const rowDate = row.date || dateText;

  const actualText = actual == null ? "No Data" : `${Number(actual).toFixed(1)} mm`;
  const normalText = normal == null ? "No Data" : `${Number(normal).toFixed(1)} mm`;
  const depText =
    departure == null
      ? "No Data"
      : `${departure > 0 ? "+" : ""}${Number(departure).toFixed(1)}%`;

  return `${notePrefix}${name} on ${rowDate}: actual ${actualText}, normal ${normalText}, departure ${depText}.`;
}


/* ------------------------------------------------------------------ */
/* Numeric grounding guard                                             */
/* ------------------------------------------------------------------ */

/**
 * Every number the answer is allowed to contain: the values actually returned
 * by the API, plus their roundings, plus the row count.
 */
function collectAllowedNumbers(apiResult) {
  const allowed = new Set();
  const add = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    allowed.add(n);
    allowed.add(Number(n.toFixed(0)));
    allowed.add(Number(n.toFixed(1)));
    allowed.add(Number(n.toFixed(2)));
    allowed.add(Math.abs(n));
    allowed.add(Number(Math.abs(n).toFixed(1)));
    allowed.add(Number(Math.abs(n).toFixed(2)));
  };

  const walk = (node, depth = 0) => {
    if (node == null || depth > 4) return;
    if (Array.isArray(node)) return node.forEach((v) => walk(v, depth + 1));
    if (typeof node === "object") return Object.values(node).forEach((v) => walk(v, depth + 1));
    if (typeof node === "number") return add(node);
    if (typeof node === "string" && /^-?\d+(\.\d+)?$/.test(node.trim())) add(node.trim());
  };

  walk(apiResult?.data);
  if (Array.isArray(apiResult?.data)) add(apiResult.data.length);
  if (apiResult?.category_miss?.departure != null) add(apiResult.category_miss.departure);
  return allowed;
}

/**
 * Numbers the model wrote, minus the ones that are structural rather than
 * factual: dates, list ordinals ("3."), and ranking positions.
 */
function extractAnswerNumbers(answer) {
  const text = String(answer || "")
    // ISO and d/m/y dates
    .replace(/\d{4}-\d{2}-\d{2}/g, " ")
    .replace(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b/g, " ")
    // list ordinals at the start of a line or after a bullet
    .replace(/(^|\n)\s*(?:[-*]\s*)?\d{1,2}[.)]\s/g, "$1 ");

  const found = [];
  for (const match of text.matchAll(/-?\d+(?:\.\d+)?/g)) {
    const n = Number(match[0]);
    if (Number.isFinite(n)) found.push(n);
  }
  return found;
}

/**
 * True when every number in the answer traces back to the API response.
 *
 * A 3.2B model will confidently invent a figure that was never in the data:
 * asked for country departure it answered "4.908 mm ... a Large Excess of
 * 43.79%" when the real value was +4.91% (Normal) and 43.79 appeared nowhere.
 * Prompt instructions did not prevent that, so the check is mechanical:
 * an ungrounded answer is discarded in favour of the deterministic formatter.
 */
function answerIsNumericallyGrounded(answer, apiResult) {
  const allowed = collectAllowedNumbers(apiResult);
  if (!allowed.size) return true; // nothing to check against

  const tolerance = 0.05;
  return extractAnswerNumbers(answer).every((n) => {
    if (allowed.has(n)) return true;
    for (const ok of allowed) {
      if (Math.abs(ok - n) <= tolerance) return true;
      // percentage rendered from the same underlying figure
      if (ok !== 0 && Math.abs(Math.abs(ok) - Math.abs(n)) / Math.abs(ok) < 0.001) return true;
    }
    return false;
  });
}


/**
 * Departure is a PERCENTAGE. The model renders it as "4.91 mm" often enough
 * that it needs a mechanical check: a number that matches a `departure` value
 * must not be followed by a mm unit. Rainfall depth and departure from normal
 * are different quantities and operational users read them differently.
 */
function answerHasUnitError(answer, apiResult) {
  const rows = Array.isArray(apiResult?.data) ? apiResult.data : [];
  const departures = rows
    .map((r) => r?.departure)
    .filter((d) => d != null && Number.isFinite(Number(d)))
    .map((d) => Number(d));
  if (!departures.length) return false;

  const text = String(answer || "");
  for (const dep of departures) {
    for (const decimals of [1, 2]) {
      const shown = Math.abs(dep).toFixed(decimals);
      // "4.91 mm", "4.91mm", "-4.91 mm"
      const re = new RegExp(`-?${shown.replace(".", "\\.")}\\s*mm\\b`, "i");
      if (re.test(text)) return true;
    }
  }
  return false;
}


/**
 * Departure categories are a pure function of the departure value, so a stated
 * category can be checked rather than trusted.
 *
 * The model wrote "Kerala rainfall for today: 0.4 mm (Normal, -96.08%)" — the
 * figures were both correct and passed the numeric guard, but -96.08% is Large
 * Deficient, not Normal. A wrong band is a worse error than a wrong number in
 * an operational context, because it is the part people act on.
 *
 * Uses getDepartureCategory() from apiExecutor so there is exactly one copy of
 * the IMD bands in the codebase.
 */
const CATEGORY_NAMES = [
  "Large Excess",
  "Large Deficient",
  "Excess",
  "Deficient",
  "Normal",
  "No Rain",
];

function answerHasCategoryError(answer, apiResult) {
  const rows = Array.isArray(apiResult?.data) ? apiResult.data : [];
  const departures = rows
    .map((r) => r?.departure)
    .filter((d) => d != null && Number.isFinite(Number(d)))
    .map((d) => Number(d));
  if (!departures.length) return false;

  const text = String(answer || "");
  // Longest names first so "Large Deficient" is not read as "Deficient".
  const stated = CATEGORY_NAMES.filter((name) =>
    new RegExp(`\\b${name.replace(/\s+/g, "\\s+")}\\b`, "i").test(text)
  );
  if (!stated.length) return false;

  const truthful = new Set(departures.map((d) => getDepartureCategory(d)));
  // Drop names that are substrings of a longer stated name already accounted for.
  const meaningful = stated.filter(
    (name) => !stated.some((other) => other !== name && other.includes(name))
  );

  return meaningful.some((name) => !truthful.has(name));
}

function resolveActionDateTokens(action) {
  if (!action?.body) return action;
  for (const key of Object.keys(action.body)) {
    if (typeof action.body[key] === "string") {
      action.body[key] = replaceDateTokens(action.body[key]);
    }
  }
  return action;
}

/**
 * If LLM returns navigation without exact route, try alias match from catalog.
 */
function enrichNavigationAction(action, question) {
  if (action?.module !== "navigation" && action?.api_id !== "resolve_product_route") {
    return action;
  }
  action.module = "navigation";
  action.api_id = "resolve_product_route";
  action.method = "NAV";

  // Vague "map" questions must not auto-pick the first catalog product
  if (isAmbiguousMapQuestion(question)) {
    action.product_name = null;
    action.route_path = null;
    action.reason = "ambiguous_map";
    return action;
  }

  if (action.route_path && action.product_name) return action;

  const q = String(question || "").toLowerCase();
  const hit = PRODUCT_ROUTES.find((p) => {
    if (action.route_path && p.route_path === action.route_path) return true;
    if (action.product_name && p.product_name === action.product_name) return true;
    return (p.aliases || []).some((a) => q.includes(a.toLowerCase()));
  });
  if (hit) {
    action.product_name = hit.product_name;
    action.route_path = hit.route_path;
  }
  return action;
}

/** Map-like products shown when the user asks a vague "map" question. */
function listMapProducts() {
  return PRODUCT_ROUTES.filter(
    (p) =>
      /map/i.test(p.product_name) ||
      /map/i.test(p.route_path) ||
      p.route_path === "/all-maps-overview"
  );
}

/**
 * True when the user asked for a map but did not name which one.
 * Examples: "map", "maps", "show map", "open map", "which map"
 */
function isAmbiguousMapQuestion(question) {
  const q = String(question || "")
    .trim()
    .toLowerCase()
    .replace(/[?.!,]+$/g, "")
    .replace(/\s+/g, " ");
  if (!q) return false;

  // Named product / alias → specific enough
  const specific = PRODUCT_ROUTES.some((p) => {
    const name = String(p.product_name || "").toLowerCase();
    if (name && q.includes(name)) return true;
    if (p.route_path && q.includes(String(p.route_path).toLowerCase())) return true;
    return (p.aliases || []).some((a) => {
      const alias = String(a || "").toLowerCase();
      return alias.length >= 4 && q.includes(alias);
    });
  });
  if (specific) return false;

  return (
    /^(maps?|show maps?|open maps?|give( me)? (a |the )?maps?|get (a |the )?maps?|find (a |the )?maps?|where( is| are)? (the )?maps?|which maps?|list maps?|i (want|need) (a |the )?maps?)$/i.test(
      q
    )
  );
}

function formatAmbiguousMapAnswer() {
  const maps = listMapProducts();
  const lines = maps
    .slice(0, 12)
    .map((p, i) => `${i + 1}. ${p.product_name}`)
    .join("\n");
  return (
    `Which map do you want?\n` +
    `Please name one, for example:\n${lines}\n` +
    `You can also say "All Maps Overview" to browse all maps.`
  );
}

/**
 * Clarify response for vague "map" questions.
 * Keep api.data empty and navigation null so the frontend does not
 * auto-render an "Open … Map" button from the first option.
 */
function buildAmbiguousMapResponse({ model = null, llm_plan_raw = null, action = null } = {}) {
  const options = listMapProducts().map(({ product_name, route_path }) => ({
    product_name,
    route_path,
  }));
  return {
    success: true,
    mode: "clarify",
    needs_clarification: true,
    model,
    answer: formatAmbiguousMapAnswer(),
    answer_mode: "clarify",
    action: action || {
      module: "clarify",
      api_id: "clarify_which_map",
      method: "CLARIFY",
      path: null,
      product_name: null,
      route_path: null,
      reason: "ambiguous_map",
    },
    navigation: null,
    clarify: {
      type: "which_map",
      prompt: "Which map do you want?",
      options,
    },
    ...(llm_plan_raw ? { llm_plan_raw } : {}),
    api: {
      ok: true,
      status: 200,
      request: null,
      row_count: 0,
      note: "Ambiguous map request — need product name.",
      usedDate: null,
      // Intentionally empty: options live under clarify.options only.
      data: [],
    },
  };
}

/** Example questions offered when a request falls outside the catalog. */
function buildScopeSuggestions() {
  return [
    ...(SAMPLE_QUESTIONS.rainfall || []).slice(0, 3),
    ...(SAMPLE_QUESTIONS.navigation || []).slice(0, 2),
  ];
}

/**
 * Question outside the IRAINS catalog (general knowledge, arithmetic, chit-chat).
 * Varsha stays scoped to rainfall + navigation, so reply with the scope and
 * examples rather than letting the model answer off-domain.
 */
function buildOutOfScopeResponse({
  action = null,
  llm_plan_raw = null,
  model = null,
} = {}) {
  return {
    success: false,
    stage: "out_of_scope",
    out_of_scope: true,
    answer:
      "That one is outside IRAINS, so I can't help with it. I'm Varsha — I only know " +
      "Indian rainfall (actual, normal and departure) and where to find each product " +
      "page. Try one of these:",
    suggestions: buildScopeSuggestions(),
    sample_questions: SAMPLE_QUESTIONS,
    ...(llm_plan_raw ? { llm_plan_raw } : {}),
    ...(action ? { action } : {}),
    model,
  };
}

let warmupPromise = null;
let warmupStatus = {
  ready: false,
  status: "idle",
  at: null,
  model: null,
  error: null,
  catalog_chars: 0,
  catalog_mtime_ms: null,
};

function snapshotWarmupStatus() {
  return { ...warmupStatus };
}

/**
 * Prepare the assistant before the first question.
 *
 * This used to push the entire API catalog through the model and record
 * status "ready" from the acknowledgement. With Ollama's 2048-token default
 * that acknowledgement was produced from a truncated prompt, so "ready" was a
 * false signal — the catalog had never fully arrived.
 *
 * Now: load the retrieval index (the real preparation), warm the chat model so
 * the first question does not pay model load time, and report the context
 * budget honestly.
 */
async function warmupCatalogIntoModel({ force = false } = {}) {
  const catalogMeta = getCatalogMeta();
  const catalogChanged =
    warmupStatus.catalog_mtime_ms != null &&
    warmupStatus.catalog_mtime_ms !== catalogMeta.mtimeMs;

  if (!force && !catalogChanged && warmupStatus.status === "ready") {
    return snapshotWarmupStatus();
  }
  if (!force && !catalogChanged && warmupPromise) {
    return warmupPromise;
  }

  warmupPromise = (async () => {
    warmupStatus = {
      ready: false,
      status: "warming",
      at: new Date().toISOString(),
      model: null,
      error: null,
      catalog_chars: catalogMeta.chars,
      catalog_mtime_ms: catalogMeta.mtimeMs,
    };

    const status = await isOllamaUp();
    if (!status.up) {
      warmupStatus = {
        ...warmupStatus,
        status: "failed",
        error: `Ollama is not running at ${status.baseUrl}`,
      };
      return snapshotWarmupStatus();
    }

    // Load the retrieval index + build the BM25 table.
    let ragMeta = { ready: false, error: "RAG disabled" };
    if (RAG_ENABLED) {
      try {
        initRag();
        ragMeta = getIndexMeta();
        if (ragMeta.stale) {
          console.warn(
            "[rag] index is STALE — a source document changed since it was built. Run: npm run rag:build"
          );
        }
      } catch (err) {
        ragMeta = { ready: false, error: err.message };
        console.warn(
          `[rag] index unavailable (${err.message}); planner will fall back to the full catalog.`
        );
      }
    }

    // Warm the chat model itself with a trivial prompt so question #1 is fast.
    const ack = await askOllama(
      [
        { role: "system", content: "You are Varsha, the iRAINS assistant." },
        { role: "user", content: 'Reply with JSON only: {"ready":true}' },
      ],
      { temperature: 0, formatJson: true, timeout: 180000 }
    );

    const budget = checkContextBudget(
      buildPlannerSystemPrompt(loadApiCatalog(), { retrieved: false })
    );

    warmupStatus = {
      ready: true,
      status: "ready",
      at: new Date().toISOString(),
      model: ack.model || status.model,
      error: null,
      catalog_chars: catalogMeta.chars,
      catalog_mtime_ms: catalogMeta.mtimeMs,
      rag: ragMeta,
      // Honest reporting: what a full-catalog prompt would cost vs the window.
      full_catalog_prompt_tokens: budget.estimated_tokens,
      num_ctx: budget.num_ctx,
      full_catalog_fits: budget.fits,
      ack: extractJsonObject(ack.content),
    };
    return snapshotWarmupStatus();
  })()
    .catch((err) => {
      warmupStatus = {
        ...warmupStatus,
        ready: false,
        status: "failed",
        at: new Date().toISOString(),
        error: err.message || "Warmup failed",
      };
      return snapshotWarmupStatus();
    })
    .finally(() => {
      warmupPromise = null;
    });

  return warmupPromise;
}

/**
 * Route/plan contradiction heal.
 *
 * The router is deterministic and independent of the model. When it says a
 * question is a data question but the planner still answers "navigation" —
 * llama3.2 does this on "Which MCs still have stations missing today?", where
 * "MC" pattern-matches the MC/RMC map route — re-plan once, saying so.
 * Only fires on contradiction, so it costs nothing on the normal path.
 *
 * Exported so rag/eval.js scores the same behaviour production runs.
 */
async function healNavigationContradiction({ action, routing, plan, plannerContext, planQuestion }) {
  if (
    routing?.route !== "data" ||
    !action ||
    (action.module !== "navigation" && action.api_id !== "resolve_product_route")
  ) {
    return action;
  }

  const retry = await askOllama(
    [
      {
        role: "system",
        content: buildPlannerSystemPrompt(plannerContext.text, {
          retrieved: plannerContext.retrieved,
        }),
      },
      { role: "user", content: planQuestion },
      { role: "assistant", content: plan.content },
      {
        role: "user",
        content:
          "That is wrong. This question asks for rainfall DATA, not for where a page lives. " +
          "Do not use navigation or resolve_product_route. Choose the data api_id from the " +
          "catalog sections above that answers the question, and return the JSON action only.",
      },
    ],
    { temperature: 0, formatJson: true }
  );

  const healed = extractJsonObject(retry.content);
  if (healed?.api_id && healed.api_id !== "resolve_product_route" && resolveAllowedApi(healed)) {
    healed.reason = `${healed.reason || ""} [healed: router said data, planner said navigation]`.trim();
    return healed;
  }
  return action;
}

/**
 * Last resort before telling a user their question is out of scope.
 *
 * When the planner cannot produce a valid action we used to answer "That one
 * is outside iRAINS" immediately — even for questions the documentation
 * answers perfectly. "u knwo spatial distirbution?" failed to plan (typos, no
 * place, no date) and was refused, while the technical document had a whole
 * module on it. Search the docs before giving up.
 */
async function tryKnowledgeFallback(question, { skipAnswerLlm = false } = {}) {
  if (!RAG_ENABLED) return null;
  try {
    const knowledge = await answerKnowledgeQuestion(question, { skipAnswerLlm });
    if (knowledge?.success && knowledge.answer) {
      return { ...knowledge, stage: "knowledge_fallback" };
    }
  } catch (err) {
    console.warn("[rag] knowledge fallback failed:", err.message);
  }
  return null;
}

/**
 * End-to-end Ollama flow for one rainfall / navigation question:
 * 1) Warmup: model reads catalog (skipped if already ready)
 * 2) LLM maps question → JSON action
 * 3) Backend executes allowlisted API (or NAV)
 * 4) LLM (or fallback) formats answer
 */
async function handleOllamaChat(question, { skipAnswerLlm = false, previousQuestion = null } = {}) {
  const status = await isOllamaUp();
  if (!status.up) {
    const err = new Error(
      `Ollama is not running at ${status.baseUrl}. Install/start Ollama and pull model "${status.model}".`
    );
    err.statusCode = 503;
    err.meta = status;
    throw err;
  }

  // Catalog must be ingested before the planner sees a user question.
  await warmupCatalogIntoModel();

  // If user only replies with all-India / whole India after a prior threshold/list Q,
  // merge into a full nationwide threshold question.
  let effectiveQuestion = String(question || "").trim();
  const prev = String(previousQuestion || "").trim();
  if (
    prev &&
    /^(all[- ]?india|whole\s+india|pan[- ]?india|india|country|all)$/i.test(
      effectiveQuestion
    )
  ) {
    if (isThresholdListQuestion(prev) || extractCategoriesFromQuestion(prev).length) {
      effectiveQuestion = `${prev} for all-India`;
    }
  }

  // Vague "map" → ask which map (do not default to one product)
  if (isAmbiguousMapQuestion(effectiveQuestion)) {
    return buildAmbiguousMapResponse({ model: null });
  }

  // Route before planning. Only "knowledge" is intercepted here — "data" and
  // "navigation" continue down the existing planner path (now RAG-fed), so all
  // clarification, sanitising and executor behaviour is unchanged.
  let routing = null;
  if (RAG_ENABLED) {
    try {
      routing = await routeQuestion(effectiveQuestion);
      if (routing.route === "knowledge") {
        const knowledge = await answerKnowledgeQuestion(effectiveQuestion, {
          skipAnswerLlm,
        });
        return { ...knowledge, routing };
      }
    } catch (err) {
      console.warn("[rag] routing failed, continuing to planner:", err.message);
    }
  }

  // Sample clarification layer: typos, invalid places, bad dates, mixed intent, ambiguity
  const preClarify = await runPreChatClarifications(effectiveQuestion);
  let locationCorrection = null;
  if (preClarify) {
    if (preClarify.kind === "location_correction") {
      locationCorrection = preClarify;
    } else {
      return preClarify;
    }
  }

  // If we soft-corrected a place name, plan with the corrected question text.
  // Replace only whole-word place tokens so "chennai deficient" is not wiped.
  const planQuestion = (() => {
    let raw = String(effectiveQuestion || "")
      .replace(/\bconfirmed_rainfall_mm\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!locationCorrection?.to || !locationCorrection?.from) return raw;
    const from = String(locationCorrection.from).trim();
    if (!from || /\s/.test(from)) {
      // Multi-word bogus span — replace first token only when it fuzzy-matches
      const first = from.split(/\s+/)[0];
      if (!first) return raw;
      return raw.replace(new RegExp(`\\b${first.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "ig"), locationCorrection.to);
    }
    return raw.replace(
      new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "ig"),
      locationCorrection.to
    );
  })();

  const plannerContext = await buildPlannerContext(planQuestion);
  const plan = await askOllama(
    [
      {
        role: "system",
        content: buildPlannerSystemPrompt(plannerContext.text, {
          retrieved: plannerContext.retrieved,
        }),
      },
      { role: "user", content: planQuestion },
    ],
    { temperature: 0, formatJson: true }
  );

  let action = extractJsonObject(plan.content);

  action = await healNavigationContradiction({
    action,
    routing,
    plan,
    plannerContext,
    planQuestion,
  });

  if (!action || !action.api_id) {
    const viaDocs = await tryKnowledgeFallback(effectiveQuestion, { skipAnswerLlm });
    if (viaDocs) return { ...viaDocs, routing };
    return buildOutOfScopeResponse({
      llm_plan_raw: plan.content,
      model: plan.model,
    });
  }

  action = enrichNavigationAction(action, effectiveQuestion);
  action = resolveActionDateTokens(action);
  // Use effective question for category/threshold/compare heal
  action = sanitizeRainfallAction(action, effectiveQuestion);
  action = sanitizeCompareAction(action, effectiveQuestion);
  action = sanitizeThresholdAction(action, effectiveQuestion);
  action = sanitizeRankingAction(action, effectiveQuestion);
  action = sanitizePlaceLevelAction(action, effectiveQuestion);
  action = applyMonthRangeFromQuestion(action, effectiveQuestion);
  action = sanitizeDatesFromQuestion(action, planQuestion);
  // Re-apply after date sanitize so intent wins over monsoon mis-routes
  action = sanitizeCompareAction(action, effectiveQuestion);
  action = sanitizeThresholdAction(action, effectiveQuestion);
  action = sanitizeRankingAction(action, effectiveQuestion);
  action = sanitizePlaceLevelAction(action, effectiveQuestion);
  action = resolveActionDateTokens(action);
  action = normalizeApiAction(action);

  // LLM still returned navigation without a concrete product
  if (
    (action.module === "navigation" || action.api_id === "resolve_product_route") &&
    !action.route_path &&
    (action.reason === "ambiguous_map" || isAmbiguousMapQuestion(effectiveQuestion))
  ) {
    return buildAmbiguousMapResponse({
      model: plan.model,
      llm_plan_raw: plan.content,
      action,
    });
  }

  if (!resolveAllowedApi(action)) {
    const viaDocs = await tryKnowledgeFallback(effectiveQuestion, { skipAnswerLlm });
    if (viaDocs) return { ...viaDocs, routing };
    return buildOutOfScopeResponse({
      action,
      llm_plan_raw: plan.content,
      model: plan.model,
    });
  }

  // Post-plan location validation / fuzzy correction (do not invent places)
  const postClarify = await runPostPlanLocationClarifications(effectiveQuestion, action);
  if (postClarify) {
    if (postClarify.kind === "location_correction") {
      locationCorrection = postClarify;
    } else {
      return {
        ...postClarify,
        model: plan.model,
        llm_plan_raw: plan.content,
      };
    }
  }

  // Ensure place filter exists when we soft-corrected a location for a category/rainfall Q
  if (locationCorrection?.to) {
    if (!action.post_filter || typeof action.post_filter !== "object") {
      action.post_filter = {};
    }
    const hasPlace =
      action.post_filter.district_name ||
      action.post_filter.state_name ||
      (Array.isArray(action.post_filter.state_names) &&
        action.post_filter.state_names.length);
    if (!hasPlace) {
      if (locationCorrection.type === "state") {
        action.post_filter.state_name = locationCorrection.to;
      } else {
        action.post_filter.district_name = locationCorrection.to;
        if (
          !action.api_id ||
          action.api_id === "fetch_state_data" ||
          action.api_id === "fetch_country_data"
        ) {
          action.api_id = "fetch_district_data";
          action.path = "/api/v1/fetchDistrictData";
          action.method = "POST";
          action = normalizeApiAction(action);
        }
      }
    }
  }

  // Re-apply category heal after location fixes (original question keeps category words)
  action = sanitizeRainfallAction(action, question);

  // Step 2: execute API / navigation
  const apiResult = await executeApiAction(action);

  const relatedCtx = extractRelatedPlaceContext(action, apiResult);
  const related_options = relatedCtx
    ? buildRelatedOptions(relatedCtx)
    : [];

  // Step 3: answer
  let answer;
  let answerMode = "fallback";
  const didYouMean =
    locationCorrection?.did_you_mean ||
    (locationCorrection?.to
      ? {
          from: locationCorrection.from || locationCorrection.corrections?.[0]?.from || null,
          to: locationCorrection.to || locationCorrection.corrections?.[0]?.to || null,
          prompt:
            locationCorrection.prefixAnswer ||
            `Did you mean ${locationCorrection.to}?`,
        }
      : null);

  if (!skipAnswerLlm) {
    try {
      const answerLlm = await askOllama(
        [
          { role: "system", content: buildAnswerSystemPrompt({ didYouMean }) },
          {
            role: "user",
            content: JSON.stringify(
              {
                question: planQuestion,
                original_question: String(question || "").trim(),
                did_you_mean: didYouMean,
                api_action: action,
                api_note: apiResult.note || null,
                category_miss: apiResult.category_miss || null,
                used_date: apiResult.usedDate || null,
                place_level: apiResult.place_level || null,
                stations_count: apiResult.stations_count || null,
                api_data_sample: Array.isArray(apiResult.data)
                  ? apiResult.data.slice(0, 40)
                  : apiResult.data,
                row_count: Array.isArray(apiResult.data)
                  ? apiResult.data.length
                  : null,
                date: moment().format("YYYY-MM-DD"),
              },
              null,
              2
            ),
          },
        ],
        { temperature: 0.2, formatJson: false }
      );
      answer = answerLlm.content?.trim() || formatFallbackAnswer(planQuestion, action, apiResult);
      answerMode = "ollama";
    } catch (_) {
      answer = formatFallbackAnswer(planQuestion, action, apiResult);
    }
  } else {
    answer = formatFallbackAnswer(planQuestion, action, apiResult);
  }

  // Numeric grounding: discard an answer containing figures that are not in
  // the API response. Rainfall numbers reach operational users — a fabricated
  // departure or category is worse than a plainer, correct sentence.
  if (answerMode === "ollama") {
    if (!answerIsNumericallyGrounded(answer, apiResult)) {
      console.warn(
        `[chat] answer discarded: ungrounded number(s) for "${planQuestion}". ` +
          `Falling back to the deterministic formatter.`
      );
      answer = formatFallbackAnswer(planQuestion, action, apiResult);
      answerMode = "fallback_ungrounded";
    } else if (answerHasUnitError(answer, apiResult)) {
      console.warn(
        `[chat] answer discarded: departure rendered in mm instead of % for "${planQuestion}".`
      );
      answer = formatFallbackAnswer(planQuestion, action, apiResult);
      answerMode = "fallback_unit_error";
    } else if (answerHasCategoryError(answer, apiResult)) {
      console.warn(
        `[chat] answer discarded: stated departure category does not match the data for "${planQuestion}".`
      );
      answer = formatFallbackAnswer(planQuestion, action, apiResult);
      answerMode = "fallback_category_error";
    }
  }

  // Category miss / empty category filter: use deterministic copy so the LLM
  // cannot contradict itself with "data is not available".
  const emptyCategoryFilter =
    action?.post_process?.type === "filter_by_departure_category" &&
    (!Array.isArray(apiResult.data) || apiResult.data.length === 0);
  if (emptyCategoryFilter) {
    answer = formatFallbackAnswer(planQuestion, action, apiResult);
    answerMode = "fallback";
  }

  // Always surface "Did you mean …?" for typos (frontend may also use did_you_mean)
  if (didYouMean?.prompt) {
    const prompt = didYouMean.prompt.trim();
    const alreadyAsked = new RegExp(
      `did you mean\\s+${didYouMean.to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "i"
    ).test(answer || "");
    if (!alreadyAsked) {
      answer = `${prompt}\n${answer || ""}`.trim();
    } else if (!/^\s*did you mean/i.test(answer || "")) {
      // LLM mentioned it later — move to the front
      answer = `${prompt}\n${String(answer)
        .replace(new RegExp(`\\s*did you mean\\s+${didYouMean.to.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\??\\s*`, "ig"), " ")
        .trim()}`;
    }
  }

  return {
    success: true,
    mode: plannerContext.retrieved ? "rag_planner" : "ollama_catalog",
    model: plan.model,
    routing,
    retrieval: plannerContext.retrieved
      ? {
          chunks: plannerContext.chunks,
          context_tokens: plannerContext.tokens,
          timings: plannerContext.timings,
        }
      : { retrieved: false, reason: plannerContext.reason },
    answer,
    answer_mode: answerMode,
    action,
    did_you_mean: didYouMean,
    location_correction: locationCorrection
      ? {
          from: didYouMean?.from || null,
          to: didYouMean?.to || null,
          corrections: locationCorrection.corrections || null,
        }
      : null,
    navigation:
      action.module === "navigation"
        ? {
            product_name: action.product_name || null,
            route_path: action.route_path || null,
          }
        : null,
    related_options,
    api: {
      ok: apiResult.ok,
      status: apiResult.status,
      request: apiResult.request,
      row_count: Array.isArray(apiResult.data) ? apiResult.data.length : null,
      note: apiResult.note || null,
      usedDate: apiResult.usedDate || null,
      category_miss: apiResult.category_miss || null,
      place_level: apiResult.place_level || null,
      stations_count: apiResult.stations_count || null,
      // Cap payload size for chat UI; row_count keeps the full match total.
      data: Array.isArray(apiResult.data)
        ? apiResult.data.slice(0, 200)
        : apiResult.data,
      truncated:
        Array.isArray(apiResult.data) && apiResult.data.length > 200
          ? true
          : false,
    },
  };
}

module.exports = {
  handleOllamaChat,
  // exported for the RAG eval harness so it scores the exact production prompt
  buildPlannerSystemPrompt,
  buildPlannerContext,
  healNavigationContradiction,
  warmupCatalogIntoModel,
  getCatalogWarmupStatus: snapshotWarmupStatus,
  isOllamaUp,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
};
