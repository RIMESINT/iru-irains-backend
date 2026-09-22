/**
 * Guidance layer: availability windows, level resolution, recommendation
 * chips, and refusals that say WHY.
 *
 * Every refusal the assistant gives should name a reason the user can act on.
 * "I could not find that" on its own tells an operator nothing — whether the
 * place was unknown, the date predates our records, or the question was never
 * in scope leads to three completely different next steps.
 */

const client = require("../../connection");
const { PRODUCT_ROUTES } = require("./catalogLoader");

/* ------------------------------------------------------------------ */
/* 1. Data availability                                               */
/* ------------------------------------------------------------------ */

/**
 * Verified floor for every administrative level: the aggregate tables
 * (district/state/subdivision/country/block) begin on 2025-06-01. Raw station
 * rows exist from 2025-01-01, but actual/normal/departure for any level is
 * computed from the aggregates, so this is the real limit for the assistant.
 */
const DATA_FLOOR = "2025-06-01";

const AVAILABILITY_TTL_MS = 60 * 60 * 1000;
let availabilityCache = null;
let availabilityAt = 0;

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

async function getDataAvailability({ force = false } = {}) {
  const now = Date.now();
  if (!force && availabilityCache && now - availabilityAt < AVAILABILITY_TTL_MS) {
    return availabilityCache;
  }

  const fallback = { from: DATA_FLOOR, to: todayIso(), source: "constant" };
  try {
    const res = await Promise.race([
      client.query(
        `SELECT to_char(min(from_date), 'YYYY-MM-DD') AS mn,
                to_char(max(to_date),   'YYYY-MM-DD') AS mx
           FROM district_data
          WHERE from_date <= CURRENT_DATE`
      ),
      new Promise((_, rej) => setTimeout(() => rej(new Error("availability timeout")), 4000)),
    ]);
    const row = res.rows?.[0];
    if (row?.mn && row?.mx) {
      availabilityCache = { from: row.mn, to: row.mx, source: "database" };
    } else {
      availabilityCache = fallback;
    }
  } catch (_) {
    availabilityCache = fallback;
  }
  availabilityAt = now;
  return availabilityCache;
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const mi = Number(m) - 1;
  return months[mi] ? `${Number(d)} ${months[mi]} ${y}` : iso;
}

/**
 * Check a requested date range against what the database actually holds.
 * @returns {Promise<{ok:boolean, reason?:string, message?:string, available:object, suggestion?:string}>}
 */
async function checkDateWindow({ startDate = null, endDate = null } = {}) {
  const available = await getDataAvailability();
  const start = startDate || null;
  const end = endDate || startDate || null;
  if (!start) return { ok: true, available };

  const iso = (v) => String(v).slice(0, 10);
  const s = iso(start);
  const e = iso(end);

  if (s < available.from && e < available.from) {
    return {
      ok: false,
      reason: "date_before_records",
      message:
        `iRAINS rainfall records begin on ${formatDate(available.from)}. ` +
        `${s === e ? formatDate(s) : `${formatDate(s)} to ${formatDate(e)}`} is before that, ` +
        `so there is no data to report — this is a limit of the records, not of the question.`,
      available,
      suggestion: available.from,
    };
  }

  // Genuinely in the future — nothing can exist for it.
  const today = todayIso();
  if (s > today) {
    return {
      ok: false,
      reason: "date_in_future",
      message:
        `${formatDate(s)} is in the future. The latest rainfall data available is for ` +
        `${formatDate(available.to)}.`,
      available,
      suggestion: available.to,
    };
  }

  // Today (or very recent) but not published yet. Do NOT refuse — the executor
  // already falls back to the most recent published day. Refusing here made
  // "rainfall in India today" fail every morning before the day's data landed.
  if (s > available.to) {
    return {
      ok: true,
      pending: true,
      reason: "not_published_yet",
      message:
        `Rainfall for ${formatDate(s)} has not been published yet — showing the ` +
        `latest available instead (${formatDate(available.to)}).`,
      available,
    };
  }

  // Range straddles the floor — answer, but say so.
  if (s < available.from && e >= available.from) {
    return {
      ok: true,
      partial: true,
      reason: "range_clipped",
      message:
        `Records begin on ${formatDate(available.from)}, so this covers ` +
        `${formatDate(available.from)} to ${formatDate(e)} rather than the full range asked for.`,
      available,
    };
  }

  return { ok: true, available };
}

/* ------------------------------------------------------------------ */
/* 2. Level resolution                                                */
/* ------------------------------------------------------------------ */

const LEVELS = ["station", "block", "district", "state", "subdivision", "region"];

const LEVEL_SQL = {
  district: `SELECT DISTINCT district_name AS n FROM public.normal_district_details WHERE district_name IS NOT NULL`,
  state: `SELECT DISTINCT state_name AS n FROM public.normal_district_details WHERE state_name IS NOT NULL`,
  subdivision: `SELECT DISTINCT subdiv_name AS n FROM public.normal_district_details WHERE subdiv_name IS NOT NULL`,
  region: `SELECT DISTINCT region_name AS n FROM public.normal_district_details WHERE region_name IS NOT NULL`,
  station: `SELECT DISTINCT station_name AS n FROM public.station_details WHERE station_name IS NOT NULL`,
  block: `SELECT DISTINCT block_name AS n FROM public.station_details WHERE block_name IS NOT NULL`,
};

const LEVEL_TTL_MS = 60 * 60 * 1000;
let levelCache = null;
let levelCacheAt = 0;

function normKey(v) {
  return String(v || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

async function loadLevelMaster({ force = false } = {}) {
  const now = Date.now();
  if (!force && levelCache && now - levelCacheAt < LEVEL_TTL_MS) return levelCache;

  const master = {};
  for (const level of LEVELS) {
    master[level] = { names: [], index: new Map() };
  }

  await Promise.all(
    LEVELS.map(async (level) => {
      try {
        const res = await Promise.race([
          client.query(LEVEL_SQL[level]),
          new Promise((_, rej) => setTimeout(() => rej(new Error("level timeout")), 5000)),
        ]);
        const names = (res.rows || []).map((r) => r.n).filter(Boolean);
        master[level].names = names;
        names.forEach((n) => master[level].index.set(normKey(n), n));
      } catch (_) {
        // level unavailable — treated as empty, never fatal
      }
    })
  );

  levelCache = master;
  levelCacheAt = now;
  return master;
}

/**
 * Which administrative levels does this name exist at?
 * "Maharashtra" -> [state]. "Chennai" -> [district, station, block].
 */
async function resolveLevels(name) {
  const key = normKey(name);
  if (!key) return [];
  const master = await loadLevelMaster();
  const hits = [];
  for (const level of LEVELS) {
    const exact = master[level].index.get(key);
    if (exact) hits.push({ level, name: exact });
  }
  return hits;
}

/** True when a name means different things at different levels. */
async function isLevelAmbiguous(name) {
  const hits = await resolveLevels(name);
  return hits.length > 1 ? hits : null;
}

/* ------------------------------------------------------------------ */
/* 3. Recommendation chips                                            */
/* ------------------------------------------------------------------ */

const TIMEFRAMES = [
  { label: "Today", value: "today", hint: "daily" },
  { label: "Yesterday", value: "yesterday", hint: "daily" },
  { label: "Last 7 days", value: "last 7 days", hint: "weekly" },
  { label: "This month", value: "this month", hint: "monthly" },
  { label: "Season so far", value: "season so far", hint: "seasonal" },
  { label: "Cumulative", value: "cumulative", hint: "cumulative" },
];

function buildTimeframeOptions() {
  return TIMEFRAMES.map((t) => ({ ...t, type: "timeframe" }));
}

const LEVEL_LABEL = {
  station: "Station",
  block: "Block",
  district: "District",
  state: "State",
  subdivision: "Subdivision",
  region: "Region",
};

/** Offer only the levels this place actually exists at. */
function buildLevelOptions(hits, { place = null } = {}) {
  return (hits || []).map((h) => ({
    label: `${LEVEL_LABEL[h.level] || h.level}: ${h.name}`,
    value: `${h.name} (${h.level})`,
    level: h.level,
    name: h.name,
    type: "level",
    available: true,
  }));
}

/** Product pages relevant to the question / action. */
function buildNavigationOptions(question = "", action = null) {
  const q = String(question || "").toLowerCase();
  const api = String(action?.api_id || "").toLowerCase();
  const scored = PRODUCT_ROUTES.map((p) => {
    let score = 0;
    const hay = `${p.product_name} ${(p.aliases || []).join(" ")}`.toLowerCase();
    for (const token of ["block", "district", "state", "subdiv", "region", "station",
                         "monsoon", "spatial", "departure", "cumulative", "weekly",
                         "statistics", "report", "map"]) {
      if (q.includes(token) && hay.includes(token)) score += 2;
      if (api.includes(token) && hay.includes(token)) score += 1;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ p }) => ({
    label: `Open: ${p.product_name}`,
    product_name: p.product_name,
    route_path: p.route_path,
    type: "navigation",
  }));
}

/**
 * Assemble the recommendation box.
 * Every section is optional; empty sections are dropped.
 */
function buildRecommendations({
  question = "",
  action = null,
  levelHits = null,
  place = null,
  includeTimeframe = false,
  includeLevels = false,
  related = [],
} = {}) {
  const box = {};
  if (includeTimeframe) box.timeframe = buildTimeframeOptions();
  if (includeLevels && levelHits?.length) box.level = buildLevelOptions(levelHits, { place });
  const nav = buildNavigationOptions(question, action);
  if (nav.length) box.navigation = nav;
  if (related?.length) box.related = related;
  return Object.keys(box).length ? box : null;
}

/* ------------------------------------------------------------------ */
/* 4. Refusals that say why                                           */
/* ------------------------------------------------------------------ */

/**
 * Human-readable reason for every way the assistant can decline.
 * The reason code travels in the response so the UI can style it and so
 * support can tell the cases apart in logs.
 */
const REFUSAL_REASONS = {
  out_of_domain:
    "That is outside iRAINS. I cover Indian rainfall — actual, normal and departure — " +
    "and where to find each product page.",
  no_doc_match:
    "I could not find that in the iRAINS documentation. It may not be documented yet, " +
    "or it may be described using different wording.",
  unknown_place:
    "That place name is not in the iRAINS masters at any level — station, block, " +
    "district, state, subdivision or region.",
  date_before_records: null, // supplied by checkDateWindow
  date_in_future: null,
  no_data_for_selection:
    "The place and date are both valid, but no rainfall was recorded against them.",
  ambiguous_level: "That name exists at more than one level, so the answer depends on which you mean.",
  ambiguous_timeframe: "I can look that up, but I need to know which period you mean.",
};

function buildScopeRefusal({
  reason = "out_of_domain",
  detail = null,
  question = "",
  action = null,
  levelHits = null,
  includeTimeframe = false,
  includeLevels = false,
  available = null,
} = {}) {
  const base = detail || REFUSAL_REASONS[reason] || REFUSAL_REASONS.out_of_domain;
  const recommendations = buildRecommendations({
    question,
    action,
    levelHits,
    includeTimeframe,
    includeLevels,
  });

  return {
    success: false,
    mode: "declined",
    declined: true,
    reason_code: reason,
    answer: base,
    why: base,
    available: available || null,
    recommendations,
    sample_questions: undefined, // filled by caller when useful
  };
}

module.exports = {
  DATA_FLOOR,
  LEVELS,
  LEVEL_LABEL,
  getDataAvailability,
  checkDateWindow,
  formatDate,
  loadLevelMaster,
  resolveLevels,
  isLevelAmbiguous,
  buildTimeframeOptions,
  buildLevelOptions,
  buildNavigationOptions,
  buildRecommendations,
  buildScopeRefusal,
  REFUSAL_REASONS,
};
