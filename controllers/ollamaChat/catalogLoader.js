const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.join(__dirname, "../../docs/IRAINS_API_CATALOG.md");

function loadApiCatalog() {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`API catalog not found at ${CATALOG_PATH}`);
  }
  return fs.readFileSync(CATALOG_PATH, "utf8");
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

module.exports = {
  loadApiCatalog,
  ALLOWED_APIS,
  CATALOG_PATH,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
};
