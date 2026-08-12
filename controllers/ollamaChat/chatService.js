const moment = require("moment");
const {
  loadApiCatalog,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
  ALLOWED_API_IDS,
  resolveAllowedApi,
} = require("./catalogLoader");
const { askOllama, extractJsonObject, isOllamaUp } = require("./ollamaClient");
const {
  executeApiAction,
  today,
  replaceDateTokens,
  sanitizeRainfallAction,
  sanitizeDatesFromQuestion,
  applyMonthRangeFromQuestion,
  extractCategoriesFromQuestion,
} = require("./apiExecutor");
const {
  runPreChatClarifications,
  runPostPlanLocationClarifications,
} = require("./clarification");

function buildPlannerSystemPrompt(catalogMarkdown) {
  return `You are an API planner for IRAINS.
Read the API catalog and map the user question to ONE action.
- Rainfall / data questions → module "rainfall" + an allowed api_id
- "Where is…" / "Open…" product/menu questions → module "navigation" with product_name + route_path
- CRITICAL: If the user only says "map" / "maps" / "show map" / "open map" without naming which product, do NOT pick a default map. Return module "navigation", api_id "resolve_product_route", product_name null, route_path null, and reason "ambiguous_map".
- CRITICAL category rule: if the user asks Large Excess / Excess / Deficient / Large Deficient / No Rain for a place, use fetch_district_data (or fetch_state_data for a state), keep post_filter for the place name, and set post_process.filter_by_departure_category with that category. NEVER invent a date range from catalog examples (e.g. do not copy 2026-07-01 to 2026-07-15 unless the user said those dates).
- If the user names no date for a category question, still use TODAY tokens (the backend may clarify).
Return ONLY valid JSON matching the catalog contract.
Use date tokens TODAY, YESTERDAY, LAST_7_START, SEASON_START when appropriate.
CRITICAL date rule: if the user says "month of June", "during June", "in June", "for June", or any whole month name without a day number, set startDate to the 1st and endDate to the last day of that month (e.g. June → 2026-06-01 and 2026-06-30). NEVER use only the 1st for a whole-month question.
Do not invent endpoints, api_id values, or routes.
api_id MUST be exactly one of: ${ALLOWED_API_IDS.join(", ")}
Never invent ids like fetch_catalog_data — that is not an API.
Do not include markdown.

Current server date: ${today()}

API CATALOG:
${catalogMarkdown}`;
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
When startDate and endDate differ, say the full range (e.g. "from 2026-06-01 to 2026-06-30"), never a single day.
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

/**
 * End-to-end Ollama flow for one rainfall / navigation question:
 * 1) LLM reads catalog → JSON action
 * 2) Backend executes allowlisted API (or NAV)
 * 3) LLM (or fallback) formats answer
 */
async function handleOllamaChat(question, { skipAnswerLlm = false } = {}) {
  const status = await isOllamaUp();
  if (!status.up) {
    const err = new Error(
      `Ollama is not running at ${status.baseUrl}. Install/start Ollama and pull model "${status.model}".`
    );
    err.statusCode = 503;
    err.meta = status;
    throw err;
  }

  // Vague "map" → ask which map (do not default to one product)
  if (isAmbiguousMapQuestion(question)) {
    return buildAmbiguousMapResponse({ model: null });
  }

  // Sample clarification layer: typos, invalid places, bad dates, mixed intent, ambiguity
  const preClarify = await runPreChatClarifications(question);
  let locationCorrection = null;
  if (preClarify) {
    if (preClarify.kind === "location_correction") {
      locationCorrection = preClarify;
    } else {
      return preClarify;
    }
  }

  const catalog = loadApiCatalog();

  // If we soft-corrected a place name, plan with the corrected question text.
  // Replace only whole-word place tokens so "chennai deficient" is not wiped.
  const planQuestion = (() => {
    let raw = String(question || "")
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

  const plan = await askOllama(
    [
      { role: "system", content: buildPlannerSystemPrompt(catalog) },
      { role: "user", content: planQuestion },
    ],
    { temperature: 0, formatJson: true }
  );

  let action = extractJsonObject(plan.content);
  if (!action || !action.api_id) {
    return {
      success: false,
      stage: "plan",
      answer:
        "Could not map this question to an API from the catalog. Please ask a rainfall or product-location question.",
      llm_plan_raw: plan.content,
      model: plan.model,
    };
  }

  action = enrichNavigationAction(action, question);
  action = resolveActionDateTokens(action);
  // Use original question for category heal so typo rewrites cannot drop "deficient"
  action = sanitizeRainfallAction(action, question);
  action = applyMonthRangeFromQuestion(action, question);
  action = sanitizeDatesFromQuestion(action, planQuestion);
  action = resolveActionDateTokens(action);
  action = normalizeApiAction(action);

  // LLM still returned navigation without a concrete product
  if (
    (action.module === "navigation" || action.api_id === "resolve_product_route") &&
    !action.route_path &&
    (action.reason === "ambiguous_map" || isAmbiguousMapQuestion(question))
  ) {
    return buildAmbiguousMapResponse({
      model: plan.model,
      llm_plan_raw: plan.content,
      action,
    });
  }

  if (!resolveAllowedApi(action)) {
    return {
      success: false,
      stage: "plan",
      answer:
        "Could not map this question to an allowed rainfall or navigation API. Please rephrase (e.g. ask for a state/district rainfall, or where a map/product is).",
      llm_plan_raw: plan.content,
      action,
      model: plan.model,
    };
  }

  // Post-plan location validation / fuzzy correction (do not invent places)
  const postClarify = await runPostPlanLocationClarifications(question, action);
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
                api_data_sample: Array.isArray(apiResult.data)
                  ? apiResult.data.slice(0, 25)
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
    mode: "ollama_catalog",
    model: plan.model,
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
    api: {
      ok: apiResult.ok,
      status: apiResult.status,
      request: apiResult.request,
      row_count: Array.isArray(apiResult.data) ? apiResult.data.length : null,
      note: apiResult.note || null,
      usedDate: apiResult.usedDate || null,
      category_miss: apiResult.category_miss || null,
      data: Array.isArray(apiResult.data)
        ? apiResult.data.slice(0, 50)
        : apiResult.data,
    },
  };
}

module.exports = {
  handleOllamaChat,
  isOllamaUp,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
};
