/**
 * Fast path: answer without calling a model at all.
 *
 * Measured on the iRAINS server, one planner call costs 30-50s warm and every
 * question makes two. But 70% of data questions leave nothing to infer — the
 * router already knows it is a data question, the resolver already knows the
 * place and its code, and a keyword maps the intent to an api_id. For those
 * the model is pure latency, and worse, it is the component that invents
 * figures the answer guards then have to catch.
 *
 * So: when intent, place and timeframe are all known with certainty, build the
 * action here and go straight to the executor. The model stays as the fallback
 * for unusual phrasing and for knowledge questions, where composing prose is
 * genuinely the job.
 */

const { resolve: resolveLocation } = require("./location/resolver");
const { PRODUCT_ROUTES } = require("./catalogLoader");
const { resolveNavigation } = require("./navResolver");

const lc = (v) => String(v || "").toLowerCase();

/**
 * Navigation is a lookup against a fixed list of product pages. It was going
 * through two model calls — 16s on an M2, minutes on the server — to return a
 * route that never changes. Match the page here; ask the model only when the
 * phrasing names no page or names several.
 */
function tryNavigation(question) {
  const q = lc(question);
  const hits = PRODUCT_ROUTES.filter((p) => {
    if (q.includes(lc(p.product_name))) return true;
    if (p.route_path && q.includes(lc(p.route_path))) return true;
    return (p.aliases || []).some((a) => a.length >= 4 && q.includes(lc(a)));
  });
  // Prefer the page whose alias matched the most words: "daily departure
  // district" beats "departure".
  const score = (p) => Math.max(
    ...[p.product_name, ...(p.aliases || [])].map((a) => (q.includes(lc(a)) ? lc(a).split(/\s+/).length : 0))
  );
  hits.sort((a, b) => score(b) - score(a));
  if (!hits.length) return null;
  if (hits.length > 1 && score(hits[0]) === score(hits[1])) return null; // genuinely ambiguous
  const page = hits[0];
  return {
    action: {
      module: "navigation",
      api_id: "resolve_product_route",
      method: "NAV",
      path: null,
      body: {},
      query: {},
      post_filter: {},
      post_process: null,
      product_name: page.product_name,
      route_path: page.route_path,
      reason: "fast path — page matched from the product list without a model",
    },
    location: null,
    reason: `navigation=${page.route_path}`,
  };
}

/** Date tokens the executor already understands. */
const TIMEFRAMES = [
  [/\btoday\b|\bnow\b|\bcurrent\b/i, { startDate: "TODAY", endDate: "TODAY" }],
  [/\byesterday\b/i, { startDate: "YESTERDAY", endDate: "YESTERDAY" }],
  [/\blast\s+7\s+days?\b|\bthis\s+week\b|\bpast\s+7\s+days?\b|\bweekly\b/i, { startDate: "LAST_7_START", endDate: "TODAY" }],
  [/\blast\s+30\s+days?\b|\bthis\s+month\b|\bpast\s+30\s+days?\b|\bmonthly\b/i, { startDate: "LAST_30_START", endDate: "TODAY" }],
  [/\bseason(al)?\b|\bso\s+far\b|\bcumulative\b|\bcummulative\b|\btill\s+date\b/i, { startDate: "SEASON_START", endDate: "TODAY" }],
];

/** ISO or "15 July 2026" style explicit dates. */
const MONTHS = { jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12 };

function explicitDates(q) {
  const iso = [...String(q).matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map((m) => m[1]);
  if (iso.length >= 2) return { startDate: iso[0], endDate: iso[1] };
  if (iso.length === 1) return { startDate: iso[0], endDate: iso[0] };
  return null;
}

function detectTimeframe(question) {
  const explicit = explicitDates(question);
  if (explicit) return explicit;
  for (const [re, body] of TIMEFRAMES) if (re.test(question)) return body;
  return null;
}

/**
 * Intent by keyword. Order matters: the most specific pattern wins, so
 * "wettest stations" is a station ranking before it is a generic ranking.
 */
const INTENTS = [
  {
    re: /\b(stations?)\b[^.]*\b(heavy\s+rainfall|wettest|highest|top\s+\d+)\b|\b(heavy\s+rainfall|wettest|top\s+\d+)\b[^.]*\bstations?\b/i,
    api_id: "fetch_station_with_max_rainfall",
    placeOptional: true,
    build: (q) => ({ body: { limit: topN(q) || 10 } }),
  },
  {
    re: /\b(above|over|more\s+than|greater\s+than|at\s+least)\s*(\d+(?:\.\d+)?)\s*mm\b/i,
    api_id: "fetch_district_data",
    placeOptional: true,
    build: (q) => ({
      post_process: { type: "filter_by_actual_min", min_mm: Number(q.match(/(\d+(?:\.\d+)?)\s*mm/i)[1]) },
    }),
  },
  {
    re: /\b(large\s+excess|large\s+def+icient|def+icient|excess|no\s+rain)\b/i,
    api_id: null, // level decides: district unless a state/region is named
    placeOptional: true,
    categories: true,
  },
  {
    re: /\b(top\s+\d+|wettest|driest|highest|lowest|heaviest)\b/i,
    api_id: null,
    placeOptional: true,
    build: (q) => ({ post_process: { type: "rank_by_actual", limit: topN(q) || 5, order: /\b(driest|lowest)\b/i.test(q) ? "asc" : "desc" } }),
  },
  { re: /\bmonsoon\s+activity\b/i, api_id: "get_monsoon_activity", placeOptional: true },
  { re: /\bspatial\s+distribution\b/i, api_id: "get_spatial_distribution_data", placeOptional: true },
  { re: /\bhow\s+many\s+stations|station\s+count|stations?\s+reported\b/i, api_id: "fetch_district_station_count", placeOptional: true },
  { re: /\bmcs?\b[^.]*\bmissing\b|\bmissing\b[^.]*\bmcs?\b/i, api_id: "fetch_centre_station_summary", placeOptional: true },
  { re: /\bimd\s*(only|or|\+|and)\s*aws|calculations?\s+mode|publishing\b/i, api_id: "get_calculations_mode", placeOptional: true, noTime: true },
];

const topN = (q) => {
  const m = String(q).match(/\btop\s+(\d{1,3})\b/i);
  return m ? Number(m[1]) : null;
};

/** Departure categories named in the question. */
const CATEGORY_MAP = [
  [/\blarge\s+excess\b/i, "Large Excess"],
  [/\blarge\s+def+icient\b/i, "Large Deficient"],
  [/\bexcess\b/i, "Excess"],
  [/\bdef+icient\b/i, "Deficient"],
  [/\bno\s+rain\b/i, "No Rain"],
  [/\bnormal\b/i, "Normal"],
];

function categoriesIn(q) {
  const out = [];
  for (const [re, name] of CATEGORY_MAP) {
    if (re.test(q)) {
      // "large excess" also matches /excess/ — keep only the specific one.
      if (name === "Excess" && /\blarge\s+excess\b/i.test(q)) continue;
      if (name === "Deficient" && /\blarge\s+def+icient\b/i.test(q)) continue;
      out.push(name);
    }
  }
  return out;
}

/** api_id + post_filter key for a resolved level. */
const LEVEL_API = {
  country: { api_id: "fetch_country_data", path: "/api/v1/fetchCountryData", key: null },
  state: { api_id: "fetch_state_data", path: "/api/v1/fetchStateData", key: "state_name" },
  district: { api_id: "fetch_district_data", path: "/api/v1/fetchDistrictData", key: "district_name" },
  subdivision: { api_id: "fetch_subdivision_data", path: "/api/v1/fetchSubDivisionData", key: "subdiv_name" },
  region: { api_id: "fetch_region_data", path: "/api/v1/fetchRegionData", key: "region_name" },
  block: { api_id: "fetch_block_data", path: "/api/v1/fetchBlockData", key: "block_name" },
  station: { api_id: "fetch_station_data", path: "/api/v1/fetchStationData", key: "station_name" },
};

const API_PATH = {
  fetch_station_with_max_rainfall: "/api/v1/fetchStationWithMaxRainfall",
  fetch_district_station_count: "/api/v1/fetchDistrictStationCount",
  fetch_centre_station_summary: "/api/v1/fetchCentreStationSummary",
  get_calculations_mode: "/api/v1/calculations-mode",
  get_monsoon_activity: "/api/v1/monsoon-activity",
  get_spatial_distribution_data: "/api/v1/getSpatialDistributionData",
};

/**
 * Try to build a complete action with no model call.
 * @returns {{action, location, reason}|null}  null means "ask the model"
 */
/** A navigation action for a known page. */
function navAction(page, why) {
  return {
    module: "navigation", api_id: "resolve_product_route", method: "NAV", path: null,
    body: {}, query: {}, post_filter: {}, post_process: null,
    product_name: page.product_name, route_path: page.route_path,
    reason: `fast path — ${why}`,
  };
}

/**
 * Exact page name first; then spelling + meaning for typos and paraphrases.
 * A close call comes back as a clarify with the candidate pages, never a guess.
 */
async function resolvePage(question) {
  const exact = tryNavigation(question);
  if (exact) return exact;
  const r = await resolveNavigation(question);
  if (r.status === "resolved") {
    return { action: navAction(r.page, r.why), location: null, reason: `navigation=${r.page.route_path} (${r.why})`, alternatives: r.alternatives };
  }
  if (r.status === "ask") {
    return {
      clarify: {
        type: "which_page",
        prompt: "Which page did you mean?",
        options: r.options.map((p) => ({ label: p.product_name, value: `where is ${p.product_name}`, product_name: p.product_name, route_path: p.route_path })),
      },
      reason: `navigation ambiguous (${r.why})`,
    };
  }
  return null;
}

/** Words that name a page rather than ask for a value. */
const PAGE_NOUN = /\b(map|maps|page|pages|report|reports|table|dashboard|download|screen|chart|graph|portal)\b/i;

/**
 * Re-route questions that name a product page.
 *
 * The keyword router sends "weekly departure homogenous map" to `data`
 * because it contains "departure" — but the user wants the page, and the
 * planner then spends 30s+ on a question with a fixed answer. Two cases:
 *
 *   data + a page noun        "...map", "...report", "download the..."
 *   knowledge + no signal     "yerlystatinstatistivs"
 *
 * Both reroute only on a CONFIDENT page match. Shared by chatService and
 * navEval so production and the eval can never drift apart.
 */
async function routeWithPages(question, routing) {
  if (!routing) return routing;
  const q = String(question || "");
  const candidate =
    (routing.route === "data" && PAGE_NOUN.test(q)) ||
    (routing.route === "knowledge" && routing.stage === "default");
  if (!candidate) return routing;
  try {
    const page = await resolvePage(q);
    if (page?.action) {
      return { route: "navigation", why: "names a product page", confidence: 0.85, stage: "page_resolver", previous: routing.route };
    }
  } catch (_) {
    // keep the original route
  }
  return routing;
}

async function tryFastPath(question, { routing } = {}) {
  if (routing?.route === "navigation") return resolvePage(question);
  if (routing?.route && routing.route !== "data") return null;

  const q = String(question || "");
  const timeframe = detectTimeframe(q);
  const location = resolveLocation(q);

  let intent = null;
  for (const cand of INTENTS) {
    if (cand.re.test(q)) { intent = cand; break; }
  }

  const placeResolved = location.status === "resolved" || location.status === "country";
  // A place that needs the user's input is never guessed here.
  if (["ambiguous", "level_mismatch", "did_you_mean"].includes(location.status)) return null;

  const cats = intent?.categories ? categoriesIn(q) : [];
  if (intent?.categories && !cats.length) return null;

  if (!intent && !placeResolved) return null;
  if (!intent?.noTime && !timeframe) return null;
  if (!intent && !placeResolved) return null;

  // Which level the answer should come from.
  const level = placeResolved ? location.target.level : "district";
  const levelSpec = LEVEL_API[level] || LEVEL_API.district;

  let api_id = intent?.api_id || levelSpec.api_id;
  let path = API_PATH[api_id] || levelSpec.path;
  if (intent?.api_id) path = API_PATH[intent.api_id] || path;

  // Categories and rankings run over the level's own rows.
  if (intent?.categories || (intent && intent.api_id === null)) {
    api_id = levelSpec.api_id === "fetch_country_data" ? "fetch_district_data" : levelSpec.api_id;
    path = api_id === "fetch_district_data" ? "/api/v1/fetchDistrictData" : levelSpec.path;
  }

  const action = {
    module: "rainfall",
    api_id,
    method: api_id === "get_calculations_mode" ? "GET" : "POST",
    path,
    body: { ...(intent?.noTime ? {} : timeframe), ...(intent?.build ? intent.build(q).body || {} : {}) },
    query: {},
    post_filter: {},
    post_process: intent?.build ? intent.build(q).post_process || null : null,
    reason: "fast path — intent, place and timeframe all determined without a model",
  };

  if (intent?.categories) {
    action.post_process = { type: "filter_by_departure_category", categories: cats };
  }

  // Place filter by NAME for now (the executor still matches on names); the
  // resolved code travels alongside so the executor can switch to code-based
  // filtering without the resolver changing.
  if (placeResolved && level !== "country" && levelSpec.key) {
    action.post_filter[levelSpec.key] = location.target.name;
    action.location_code = { level, code: location.target.code, name: location.target.name };
  }

  return {
    action,
    location,
    reason: `intent=${api_id} place=${placeResolved ? location.target.label : "all-India"} time=${JSON.stringify(action.body)}`,
  };
}

module.exports = { tryFastPath, resolvePage, routeWithPages, tryNavigation, detectTimeframe, categoriesIn, INTENTS };
