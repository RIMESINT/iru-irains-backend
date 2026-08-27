const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.join(__dirname, "../../docs/IRAINS_API_CATALOG.md");

let catalogCache = { text: null, mtimeMs: null };

function getCatalogStat() {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`API catalog not found at ${CATALOG_PATH}`);
  }
  return fs.statSync(CATALOG_PATH);
}

function loadApiCatalog() {
  const stat = getCatalogStat();
  if (catalogCache.text != null && catalogCache.mtimeMs === stat.mtimeMs) {
    return catalogCache.text;
  }
  catalogCache = {
    text: fs.readFileSync(CATALOG_PATH, "utf8"),
    mtimeMs: stat.mtimeMs,
  };
  return catalogCache.text;
}

function getCatalogMeta() {
  const text = loadApiCatalog();
  return {
    path: CATALOG_PATH,
    chars: text.length,
    mtimeMs: catalogCache.mtimeMs,
  };
}

/**
 * Allow only known rainfall chat endpoints from the catalog.
 * Expand this list as more modules are enabled.
 */
const ALLOWED_APIS = {
  fetch_district_data: {
    method: "POST",
    path: "/api/v1/fetchDistrictData",
  },
  fetch_state_data: {
    method: "POST",
    path: "/api/v1/fetchStateData",
  },
  fetch_subdivision_data: {
    method: "POST",
    path: "/api/v1/fetchSubDivisionData",
  },
  fetch_region_data: {
    method: "POST",
    path: "/api/v1/fetchRegionData",
  },
  fetch_country_data: {
    method: "POST",
    path: "/api/v1/fetchCountryData",
  },
  fetch_cumulative_country_data: {
    method: "POST",
    path: "/api/v1/fetchCummulativeCountryData",
  },
  fetch_block_data: {
    method: "POST",
    path: "/api/v1/fetchBlockData",
  },
  fetch_block_rainfall_analysis: {
    method: "POST",
    path: "/api/v1/fetchBlockRainfallAnalysis",
  },
  fetch_district_data_with_aws: {
    method: "POST",
    path: "/api/v1/fetchDistrictDataWithAWS",
  },
  fetch_state_data_with_aws: {
    method: "POST",
    path: "/api/v1/fetchStateDataWithAWS",
  },
  fetch_subdivision_data_with_aws: {
    method: "POST",
    path: "/api/v1/fetchSubDivisionDataWithAWS",
  },
  fetch_country_data_with_aws: {
    method: "POST",
    path: "/api/v1/fetchCountryDataWithAWS",
  },
  fetch_district_station_count: {
    method: "POST",
    path: "/api/v1/fetchDistrictStationCount",
  },
  fetch_centre_station_summary: {
    method: "POST",
    path: "/api/v1/fetchCentreStationSummary",
  },
  fetch_station_with_max_rainfall: {
    method: "POST",
    path: "/api/v1/fetchStationWithMaxRainfall",
  },
  fetch_station_data: {
    method: "POST",
    path: "/api/v1/fetchStationData",
  },
  fetch_district_range_statistics: {
    method: "POST",
    path: "/api/v1/fetchDistrictRangeStatistics",
  },
  fetch_state_range_statistics: {
    method: "POST",
    path: "/api/v1/fetchStateRangeStatistics",
  },
  fetch_subdivision_range_statistics: {
    method: "POST",
    path: "/api/v1/fetchSubdivisionRangeStatistics",
  },
  get_latest_five_year_district: {
    method: "POST",
    path: "/api/v1/getLatestFiveYearDataOfDistrict",
  },
  get_calculations_mode: {
    method: "GET",
    path: "/api/v1/calculations-mode",
  },
  get_all_districts: {
    method: "GET",
    path: "/api/v1/getAllDistrict",
  },
  get_all_states: {
    method: "GET",
    path: "/api/v1/getAllStates",
  },
  get_all_subdivisions: {
    method: "GET",
    path: "/api/v1/getAllSubDivisions",
  },
  top_rainfall_stations: {
    method: "GET",
    path: "/api/v1/top-rainfall-stations",
  },
  get_spatial_distribution_data: {
    method: "GET",
    path: "/api/v1/getSpatialDistributionData",
  },
  get_spatial_distribution_data_state: {
    method: "GET",
    path: "/api/v1/getSpatialDistributionDataState",
  },
  get_monsoon_activity: {
    method: "POST",
    path: "/api/v1/monsoon-activity",
  },
  get_monsoon_activity_district: {
    method: "POST",
    path: "/api/v1/monsoon-activity-district",
  },
  get_monsoon_activity_subdiv_last7: {
    method: "POST",
    path: "/api/v1/monsoon-activity-subdiv-last7",
  },
  get_monsoon_activity_subdiv_last30: {
    method: "POST",
    path: "/api/v1/monsoon-activity-subdiv-last30",
  },
  get_monsoon_activity_district_last7: {
    method: "POST",
    path: "/api/v1/monsoon-activity-district-last7",
  },
  get_monsoon_activity_district_last30: {
    method: "POST",
    path: "/api/v1/monsoon-activity-district-last30",
  },
  resolve_product_route: {
    method: "NAV",
    path: null,
  },
};

/** Sample questions used for training/demo (catalog few-shot + UI hints). */
const SAMPLE_QUESTIONS = {
  rainfall: [
    "What is today’s rainfall for Maharashtra?",
    "What is the departure from normal for Maharashtra today?",
    "Show Actual vs Departure for Maharashtra from 2026-05-01 to 2026-05-10",
    "Which districts are deficient / large deficient today?",
    "Which districts are in excess / large excess today?",
    "What is country / all-India rainfall today?",
    "What is rainfall for last 7 days / this week?",
    "What is seasonal / cumulative rainfall so far?",
    "Give actual, normal and % departure for Chennai district from 01-Jul to 15-Jul.",
    "Compare rainfall of Tamil Nadu vs Kerala for yesterday.",
    "Top 10 wettest districts today.",
    "Top 5 wettest states this week.",
    "Which place recorded the highest rainfall yesterday?",
    "List districts with rainfall above 100 mm today.",
    "Which stations recorded heavy rainfall last week?",
    "What is today’s rainfall for Chennai district?",
    "What is rainfall at Nungambakkam station today?",
    "District rainfall including AWS for yesterday.",
    "Are we publishing IMD-only or IMD+AWS?",
    "How many stations reported per district today?",
    "Which MCs still have stations missing today?",
    "Give me one-line state summary for the monsoon so far.",
  ],
  spatial_monsoon: [
    "What is the spatial distribution for Kerala subdivision today?",
    "Is monsoon Weak / Normal / Active / Vigorous over Kerala today?",
    "Monsoon activity for last 7 days.",
    "Monsoon activity at district level for today.",
    "Which subdivisions are under active / vigorous monsoon?",
  ],
  navigation: [
    "Where is the daily actual state rainfall map?",
    "Open daily departure district (Pan India) map.",
    "Where is weekly departure homogenous map?",
    "Where is cumulative departure country map?",
    "Where is block rainfall map (actual / AWS)?",
    "Where is monsoon activity?",
    "Where is spatial distribution / spatial table?",
    "Where is station level data?",
    "Where is station statistics?",
    "Where is yearly statistics?",
    "Where is all statistics?",
    "Where is data entry / verification?",
    "Where are annual–seasonal–monthly maps?",
    "Where is All Maps home overview?",
    "Where is PDF rainfall report download?",
    "Where is email dissemination / send reports?",
    "Where is MC/RMC state / subdiv / region map?",
  ],
};

/** Canonical product routes for navigation answers. */
const PRODUCT_ROUTES = [
  {
    product_name: "Daily Actual State Rainfall Map",
    route_path: "/daily-actual-state-map",
    aliases: ["daily actual state", "actual state rainfall map"],
  },
  {
    product_name: "Daily Departure District (Pan India) Map",
    route_path: "/daily-departure-district-map",
    aliases: ["daily departure district", "pan india departure"],
  },
  {
    product_name: "Weekly Departure Homogenous Map",
    route_path: "/weekly-departure-homogenous",
    aliases: ["weekly departure homogenous"],
  },
  {
    product_name: "Cumulative Departure Country Map",
    route_path: "/cumulative-departure-country",
    aliases: ["cumulative departure country"],
  },
  {
    product_name: "Block Rainfall Map (Actual / AWS)",
    route_path: "/block-rainfall-map",
    aliases: ["block rainfall map", "block rainfall aws"],
  },
  {
    product_name: "Monsoon Activity",
    route_path: "/monsoon-activity",
    aliases: ["monsoon activity"],
  },
  {
    product_name: "Spatial Distribution Table",
    route_path: "/spatial-distribution-table",
    aliases: ["spatial distribution", "spatial table"],
  },
  {
    product_name: "Station Level Data",
    route_path: "/station-level-data",
    aliases: ["station level data"],
  },
  {
    product_name: "Station Statistics",
    route_path: "/station-statistics",
    aliases: ["station statistics"],
  },
  {
    product_name: "Yearly Station Statistics",
    route_path: "/yearlystationstatistics",
    aliases: [
      "yearly statistics",
      "yearly station statistics",
      "yearly stats",
      "annual station statistics",
    ],
  },
  {
    product_name: "All Statistics",
    route_path: "/all-statistics",
    aliases: ["all statistics", "all stats"],
  },
  {
    product_name: "Data Entry / Verification",
    route_path: "/data-entry-verification",
    aliases: ["data entry", "verification"],
  },
  {
    product_name: "Annual–Seasonal–Monthly Maps",
    route_path: "/maps/annual-seasonal-monthly",
    aliases: ["annual seasonal monthly", "annual-seasonal-monthly"],
  },
  {
    product_name: "All Maps Overview",
    route_path: "/all-maps-overview",
    aliases: ["all maps", "maps overview"],
  },
  {
    product_name: "PDF Rainfall Report Download",
    route_path: "/reports/pdf-download",
    aliases: ["pdf rainfall report", "pdf download"],
  },
  {
    product_name: "Email Dissemination",
    route_path: "/email-dissemination",
    aliases: ["email dissemination", "send reports"],
  },
  {
    product_name: "MC/RMC Regional Maps",
    route_path: "/mc-rmc-regional-maps",
    aliases: ["mc/rmc", "mc rmc", "regional maps"],
  },
];

/** Sorted list of allowlisted api_id values for planner prompts. */
const ALLOWED_API_IDS = Object.keys(ALLOWED_APIS);

/**
 * Resolve an action to an allowlisted API using api_id, then path+method.
 * Returns { apiId, allowed } or null if nothing matches.
 */
function resolveAllowedApi(action = {}) {
  const apiId = action.api_id;
  if (apiId && ALLOWED_APIS[apiId]) {
    return { apiId, allowed: ALLOWED_APIS[apiId] };
  }

  const method = String(action.method || "").toUpperCase();
  const path = action.path || null;
  if (path && method) {
    const match = Object.entries(ALLOWED_APIS).find(
      ([, spec]) =>
        spec.path === path && String(spec.method).toUpperCase() === method
    );
    if (match) {
      return { apiId: match[0], allowed: match[1] };
    }
  }

  return null;
}

module.exports = {
  loadApiCatalog,
  getCatalogMeta,
  ALLOWED_APIS,
  ALLOWED_API_IDS,
  resolveAllowedApi,
  CATALOG_PATH,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
};
