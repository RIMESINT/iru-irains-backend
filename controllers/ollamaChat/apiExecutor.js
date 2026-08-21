const axios = require("axios");
const moment = require("moment");
const client = require("../../connection");
const { resolveAllowedApi } = require("./catalogLoader");

function today() {
  return moment().format("YYYY-MM-DD");
}

function yesterday() {
  return moment().subtract(1, "day").format("YYYY-MM-DD");
}

function last7Start() {
  return moment().subtract(6, "days").format("YYYY-MM-DD");
}

function last30Start() {
  return moment().subtract(29, "days").format("YYYY-MM-DD");
}

/** SW monsoon season start: 1 June of current year (previous year if before June). */
function seasonStart() {
  const now = moment();
  const year = now.month() >= 5 ? now.year() : now.year() - 1;
  return moment({ year, month: 5, day: 1 }).format("YYYY-MM-DD");
}

function replaceDateTokens(value) {
  if (typeof value !== "string") return value;
  const token = value.trim().toUpperCase();
  if (token === "TODAY") return today();
  if (token === "YESTERDAY") return yesterday();
  if (token === "LAST_7_START") return last7Start();
  if (token === "LAST_30_START") return last30Start();
  if (token === "SEASON_START") return seasonStart();
  return value;
}

function normalizeBody(body = {}) {
  const out = {};
  for (const [k, v] of Object.entries(body || {})) {
    out[k] = typeof v === "string" ? replaceDateTokens(v) : v;
  }
  if (!out.startDate && !out.endDate) {
    out.startDate = today();
    out.endDate = today();
  } else if (!out.startDate) {
    out.startDate = out.endDate;
  } else if (!out.endDate) {
    out.endDate = out.startDate;
  }
  return out;
}

const MONTH_NAMES = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sep: 9,
  sept: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

/**
 * Detect whole-month intent in the user question and force start/end to
 * that month's first and last day. Prevents LLM collapsing "month of June"
 * into only 2026-06-01, or inventing a wrong year (e.g. 2023) from catalog examples.
 */
function applyMonthRangeFromQuestion(action, question) {
  if (!action || typeof action !== "object") return action;
  const q = String(question || "");
  if (!q.trim()) return action;

  // Specific calendar day → do not expand (e.g. "20th June", "June 20", "01-Jun")
  const hasSpecificDay =
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(
      q
    ) ||
    /\b\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?\b/.test(q) ||
    /\b\d{4}-\d{2}-\d{2}\b/.test(q);

  if (hasSpecificDay) return action;

  const monthMatch = q.match(
    /\b(?:during\s+(?:the\s+)?(?:month\s+of\s+)?|throughout\s+(?:the\s+)?(?:month\s+of\s+)?|(?:for|in|of|on|at)\s+(?:the\s+)?(?:month\s+of\s+)?|month\s+of\s+|whole\s+(?:of\s+)?(?:the\s+)?month\s+of\s+)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+(?:month|months))?(?:\s+(\d{4}))?\b/i
  );

  if (!monthMatch) return action;

  const monthWord = monthMatch[1].toLowerCase();
  const monthNum = MONTH_NAMES[monthWord];
  if (!monthNum) return action;

  // Clear month intent: "month of …", "on june", "june month", "in june", "june 2026", …
  const wholeMonthIntent =
    /\b(month\s+of|during|throughout|whole\s+month|for\s+the\s+month|in\s+the\s+month)\b/i.test(
      q
    ) ||
    new RegExp(
      `\\b(in|for|during|throughout|on|at)\\s+(the\\s+)?(month\\s+of\\s+)?${monthWord}\\b`,
      "i"
    ).test(q) ||
    new RegExp(`\\b${monthWord}\\s+(month|months)\\b`, "i").test(q) ||
    new RegExp(`\\bmonth\\s+${monthWord}\\b`, "i").test(q) ||
    new RegExp(`\\b${monthWord}\\s+\\d{4}\\b`, "i").test(q);

  if (!wholeMonthIntent) return action;

  // Explicit year in the question wins; otherwise use the current server year
  // (never keep a hallucinated catalog year like 2023).
  const year = monthMatch[2] ? Number(monthMatch[2]) : moment().year();
  const start = moment({ year, month: monthNum - 1, day: 1 });
  const end = start.clone().endOf("month");

  if (!action.body || typeof action.body !== "object") action.body = {};
  action.body.startDate = start.format("YYYY-MM-DD");
  action.body.endDate = end.format("YYYY-MM-DD");
  return action;
}

function getDepartureCategory(departure) {
  if (departure === null || departure === undefined || Number.isNaN(Number(departure))) {
    return "No Data";
  }
  const value = Number(departure);
  if (value === -100) return "No Rain";
  if (value >= 60) return "Large Excess";
  if (value >= 20) return "Excess";
  if (value >= -19 && value <= 19) return "Normal";
  if (value >= -59 && value <= -20) return "Deficient";
  if (value >= -99 && value <= -60) return "Large Deficient";
  return "No Data";
}

function normalizeNameKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function namesMatch(actual, expected) {
  const a = String(actual || "").toLowerCase().trim();
  const e = String(expected || "").toLowerCase().trim();
  if (!a || !e) return false;
  if (a === e) return true;
  // TAMILNADU ↔ Tamil Nadu / TamilNadu
  const an = normalizeNameKey(a);
  const en = normalizeNameKey(e);
  if (an === en) return true;
  return an.includes(en) || en.includes(an);
}

function applyPostFilter(rows, postFilter = {}) {
  if (!Array.isArray(rows) || !postFilter || !Object.keys(postFilter).length) {
    return rows;
  }

  // Compare multiple states: { state_names: ["Tamil Nadu", "Kerala"] }
  if (Array.isArray(postFilter.state_names) && postFilter.state_names.length) {
    return rows.filter((row) =>
      postFilter.state_names.some((name) => namesMatch(row.state_name, name))
    );
  }

  return rows.filter((row) =>
    Object.entries(postFilter).every(([key, expected]) => {
      if (key === "state_names") return true;
      if (expected == null || expected === "") return true;

      // Alias common name fields across rainfall / spatial / monsoon payloads
      let actual = row[key];
      if (actual == null && key === "subdiv_name") {
        actual = row.subdivision_name || row.name;
      } else if (actual == null && key === "subdivision_name") {
        actual = row.subdiv_name || row.name;
      } else if (actual == null && key === "district_name") {
        actual = row.name;
      } else if (actual == null && key === "station_name") {
        actual = row.name || row.station;
      } else if (actual == null && key === "name") {
        actual =
          row.subdiv_name ||
          row.subdivision_name ||
          row.district_name ||
          row.station_name;
      }

      if (actual == null) {
        if (key === "state_name" && row.state_name == null) return false;
        return false;
      }
      if (Array.isArray(expected)) {
        return expected.some((item) =>
          typeof item === "string" && typeof actual === "string"
            ? namesMatch(actual, item)
            : String(actual).toLowerCase() === String(item).toLowerCase()
        );
      }
      if (typeof expected === "string" && typeof actual === "string") {
        return namesMatch(actual, expected);
      }
      return String(actual).toLowerCase() === String(expected).toLowerCase();
    })
  );
}

function normalizeCategoryName(value) {
  const raw = String(value || "").trim().toLowerCase().replace(/[_-]+/g, " ");
  const map = {
    "large excess": "Large Excess",
    "excess": "Excess",
    "normal": "Normal",
    "deficient": "Deficient",
    "large deficient": "Large Deficient",
    "no rain": "No Rain",
    "no data": "No Data",
  };
  return map[raw] || value;
}

/**
 * Detect departure categories mentioned in the user question.
 * Longer phrases first so "large excess" ≠ "excess".
 */
function extractCategoriesFromQuestion(question) {
  const q = String(question || "").toLowerCase();
  if (!q.trim()) return [];
  const cats = [];
  const add = (name) => {
    if (!cats.includes(name)) cats.push(name);
  };

  if (/\blarge\s+excesss?\b/.test(q)) add("Large Excess");
  else if (/\bexcesss?\b/.test(q)) add("Excess");

  if (/\blarge\s+def+icients?\b/.test(q)) add("Large Deficient");
  else if (/\bdef+icients?\b/.test(q)) add("Deficient");

  if (/\bno\s*rain\b/.test(q)) add("No Rain");

  // "normal" alone is too ambiguous; require rainfall/category context
  if (
    /\bnormal\b/.test(q) &&
    /\b(category|departure|districts?|states?|rainfall|rain)\b/.test(q)
  ) {
    add("Normal");
  }

  return cats;
}

function extractThresholdMm(question) {
  const q = String(question || "");
  const m = q.match(
    /\b(?:above|over|greater\s+than|more\s+than|at\s+least|>=?)\s*(\d+(?:\.\d+)?)\s*(?:mm)?\b/i
  );
  if (m) return Number(m[1]);
  const m2 = q.match(
    /\b(\d+(?:\.\d+)?)\s*mm\b/i
  );
  if (m2 && /\b(above|over|greater|more|at\s+least|threshold)\b/i.test(q)) {
    return Number(m2[1]);
  }
  return null;
}

/**
 * Parse a specific calendar day from the question (e.g. "25th july", "July 25 2026").
 */
function parseExplicitDayFromQuestion(question) {
  const q = String(question || "");
  if (!q.trim()) return null;

  const iso = q.match(/\b(\d{4}-\d{2}-\d{2})\b/);
  if (iso && moment(iso[1], "YYYY-MM-DD", true).isValid()) {
    return iso[1];
  }

  const dmy = q.match(/\b(\d{1,2})[-/](\d{1,2})(?:[-/](\d{2,4}))?\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = dmy[3] ? Number(dmy[3]) : moment().year();
    if (year < 100) year += 2000;
    const m = moment({ year, month: month - 1, day });
    if (m.isValid()) return m.format("YYYY-MM-DD");
  }

  const dayFirst = q.match(
    /\b(\d{1,2})(st|nd|rd|th)?\s+(?:of\s+)?(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+(\d{4}))?\b/i
  );
  if (dayFirst) {
    const day = Number(dayFirst[1]);
    const monthNum = MONTH_NAMES[dayFirst[3].toLowerCase()];
    const year = dayFirst[4] ? Number(dayFirst[4]) : moment().year();
    if (monthNum) {
      const m = moment({ year, month: monthNum - 1, day });
      if (m.isValid()) return m.format("YYYY-MM-DD");
    }
  }

  const monthFirst = q.match(
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(st|nd|rd|th)?(?:\s+(\d{4}))?\b/i
  );
  if (monthFirst) {
    const monthNum = MONTH_NAMES[monthFirst[1].toLowerCase()];
    const day = Number(monthFirst[2]);
    const year = monthFirst[4] ? Number(monthFirst[4]) : moment().year();
    if (monthNum) {
      const m = moment({ year, month: monthNum - 1, day });
      if (m.isValid()) return m.format("YYYY-MM-DD");
    }
  }

  return null;
}

/**
 * "highest rainfall", "wettest", "max rainfall", "top rainfall" questions.
 */
function isHighestRainfallQuestion(question) {
  const q = String(question || "");
  if (!q.trim()) return false;
  // Explicit monsoon wording → not a ranking question
  if (
    /\b(monsoon\s+activity|weak|active|vigorous|subdued|isolated|scattered|fairly\s+widespread|widespread)\b/i.test(
      q
    ) &&
    !/\b(highest|wettest|max(?:imum)?)\s+(rainfall|rain)\b/i.test(q)
  ) {
    return false;
  }
  return (
    /\b(highest|wettest|max(?:imum)?|heaviest|heavy)\s+(rainfall|rain|precipitation|stations?)\b/i.test(
      q
    ) ||
    /\b(rainfall|rain)\s+(received|recorded|observed).{0,40}\b(highest|max(?:imum)?|heavy)\b/i.test(
      q
    ) ||
    /\b(highest|max(?:imum)?)\b.{0,40}\b(rainfall|rain)\b/i.test(q) ||
    /\bheavy\s+rainfall\b/i.test(q) ||
    /\btop\s+\d+\s+wettest\b/i.test(q) ||
    /\bwettest\s+(districts?|states?|places?|blocks?|stations?)\b/i.test(q) ||
    /\bheaviest\s+(rain|rainfall|stations?)\b/i.test(q)
  );
}

/**
 * "Compare Tamil Nadu vs Kerala in June" → fetch_state_data + state_names.
 * Never monsoon / nationwide district dumps.
 */
const COMPARE_STATE_ALIASES = [
  ["tamil nadu", "Tamil Nadu"],
  ["tamilnadu", "Tamil Nadu"],
  ["tn", "Tamil Nadu"],
  ["kerala", "Kerala"],
  ["karnataka", "Karnataka"],
  ["maharashtra", "Maharashtra"],
  ["gujarat", "Gujarat"],
  ["rajasthan", "Rajasthan"],
  ["odisha", "Odisha"],
  ["orissa", "Odisha"],
  ["west bengal", "West Bengal"],
  ["andhra pradesh", "Andhra Pradesh"],
  ["andhra", "Andhra Pradesh"],
  ["telangana", "Telangana"],
  ["madhya pradesh", "Madhya Pradesh"],
  ["uttar pradesh", "Uttar Pradesh"],
  ["bihar", "Bihar"],
  ["assam", "Assam"],
  ["punjab", "Punjab"],
  ["haryana", "Haryana"],
  ["himachal pradesh", "Himachal Pradesh"],
  ["uttarakhand", "Uttarakhand"],
  ["jharkhand", "Jharkhand"],
  ["chhattisgarh", "Chhattisgarh"],
  ["goa", "Goa"],
  ["delhi", "Delhi"],
  ["jammu and kashmir", "Jammu and Kashmir"],
  ["jammu & kashmir", "Jammu and Kashmir"],
];

function isCompareQuestion(question) {
  const q = String(question || "");
  return (
    /\bcompar(?:e|ison|ing)\b/i.test(q) ||
    /\bvs\.?\b/i.test(q) ||
    /\bversus\b/i.test(q)
  );
}

function resolveCompareStateName(raw) {
  const cleaned = String(raw || "")
    .replace(/\b(rainfall|rain|state|data|month|june|july|august|for|in|on|the|of)\b/gi, " ")
    .replace(/[?.!,]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  const key = cleaned.toLowerCase();
  for (const [alias, name] of COMPARE_STATE_ALIASES) {
    if (key === alias || key.includes(alias) || alias.includes(key)) {
      return name;
    }
  }
  // Title-case fallback for unknown but plausible state phrases
  if (cleaned.length >= 3 && cleaned.length <= 40) {
    return cleaned
      .split(/\s+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }
  return null;
}

function extractCompareStatePair(question) {
  const q = String(question || "").trim();
  if (!q) return null;

  const patterns = [
    /\bcompar(?:e|ison|ing)\s+(.+?)\s+(?:vs\.?|versus|with|and|to)\s+(.+?)(?:\s+(?:in|for|on|during|over)\s+.+)?$/i,
    /\b(.+?)\s+(?:vs\.?|versus)\s+(.+?)(?:\s+(?:in|for|on|during|over)\s+.+)?$/i,
  ];

  for (const re of patterns) {
    const m = q.match(re);
    if (!m) continue;
    const a = resolveCompareStateName(m[1]);
    const b = resolveCompareStateName(m[2]);
    if (a && b && a.toLowerCase() !== b.toLowerCase()) {
      return [a, b];
    }
  }
  return null;
}

function sanitizeCompareAction(action, question = "") {
  if (!action || typeof action !== "object") return action;
  const q = String(question || "");
  if (!isCompareQuestion(q)) return action;

  const pair = extractCompareStatePair(q);
  if (!pair) return action;

  action.module = "rainfall";
  action.api_id = "fetch_state_data";
  action.method = "POST";
  action.path = "/api/v1/fetchStateData";
  action.post_filter = { state_names: pair };
  action.post_process = null;
  action.body = action.body || {};
  action.reason = `Compare ${pair[0]} vs ${pair[1]} rainfall`;
  return action;
}

/**
 * Force highest/wettest/heavy-rainfall questions onto ranking APIs — never monsoon.
 * Station-level "heavy rainfall stations" → fetchStationWithMaxRainfall.
 * Prefer meteorological wording "Heavy Rainfall" (not "Heaviest Rainfall").
 */
function sanitizeRankingAction(action, question = "") {
  if (!action || typeof action !== "object") return action;
  const q = String(question || "");
  if (
    !isHighestRainfallQuestion(q) &&
    !/\btop\s+\d+\s+wettest\b/i.test(q) &&
    !/\bheavy\s+rainfall\b/i.test(q)
  ) {
    return action;
  }

  // Named place rainfall (not a ranking) — leave for place-level sanitizer
  if (
    /\bheavy\s+rainfall\b/i.test(q) &&
    !/\b(stations?|districts?|states?|places?|top\s+\d+|highest|wettest|which|list)\b/i.test(
      q
    )
  ) {
    return action;
  }

  const wantsStations =
    /\bstations?\b/i.test(q) ||
    /\bheavy\s+rainfall\s+stations?\b/i.test(q) ||
    /\bheaviest\s+stations?\b/i.test(q) ||
    /\bstation[- ]level\b/i.test(q);

  if (wantsStations) {
    const topNMatch = q.match(/\btop\s+(\d+)\b/i);
    const limit = topNMatch
      ? Math.max(1, Math.min(100, parseInt(topNMatch[1], 10)))
      : 10;
    action.module = "rainfall";
    action.api_id = "fetch_station_with_max_rainfall";
    action.method = "POST";
    action.path = "/api/v1/fetchStationWithMaxRainfall";
    action.post_filter = {};
    action.post_process = null;
    action.body = action.body || {};
    action.body.limit = limit;
    const day = parseExplicitDayFromQuestion(q);
    if (day) {
      action.body.startDate = day;
      action.body.endDate = day;
    } else if (/\byesterday\b/i.test(q)) {
      action.body.startDate = yesterday();
      action.body.endDate = yesterday();
    } else if (
      /\b(last\s+7\s+days|past\s+7\s+days|this\s+week|last\s+week)\b/i.test(q)
    ) {
      action.body.startDate = last7Start();
      action.body.endDate = today();
    } else if (!questionHasExplicitDate(q) || /\btoday\b/i.test(q)) {
      action.body.startDate = today();
      action.body.endDate = today();
    } else {
      if (!action.body.startDate) action.body.startDate = last7Start();
      if (!action.body.endDate) action.body.endDate = today();
    }
    action.reason = `Heavy Rainfall stations (limit ${limit})`;
    return action;
  }

  const wantsStates = /\bstates?\b/i.test(q) && !/\bdistricts?\b/i.test(q);
  const topNMatch = q.match(/\btop\s+(\d+)\b/i);
  const limit = topNMatch
    ? Math.max(1, Math.min(50, parseInt(topNMatch[1], 10)))
    : /\b(highest|max(?:imum)?)\b/i.test(q)
      ? 5
      : 10;

  action.module = "rainfall";
  action.api_id = wantsStates ? "fetch_state_data" : "fetch_district_data";
  action.method = "POST";
  action.path = wantsStates
    ? "/api/v1/fetchStateData"
    : "/api/v1/fetchDistrictData";
  action.post_filter = {};
  action.post_process = {
    type: "rank_by_actual",
    limit,
    order: "desc",
  };
  action.body = action.body || {};

  const day = parseExplicitDayFromQuestion(q);
  if (day) {
    action.body.startDate = day;
    action.body.endDate = day;
  } else if (/\byesterday\b/i.test(q)) {
    action.body.startDate = yesterday();
    action.body.endDate = yesterday();
  } else if (/\btoday\b/i.test(q) || !questionHasExplicitDate(q)) {
    action.body.startDate = today();
    action.body.endDate = today();
  }

  action.reason = `Highest/wettest / Heavy Rainfall ranking (limit ${limit})`;
  return action;
}

/**
 * Nationwide / list threshold questions ("districts with rainfall above 50 mm").
 */
function isThresholdListQuestion(question) {
  const q = String(question || "");
  if (!q.trim()) return false;
  const hasThreshold =
    /\b(above|over|greater\s+than|more\s+than|at\s+least|>=?)\s*\d+(\.\d+)?\s*(mm)?\b/i.test(
      q
    ) ||
    (/\b\d+(\.\d+)?\s*mm\b/i.test(q) &&
      /\b(above|over|greater|more|at\s+least)\b/i.test(q));
  if (!hasThreshold) return false;
  return (
    /\b(districts?|states?|blocks?|subdivisions?|regions?)\b/i.test(q) ||
    /\b(list|show|find|which|any)\b/i.test(q)
  );
}

/**
 * Force threshold list questions onto fetch_district_data + filter_by_actual_min.
 * Avoids monsoon mis-routes when user replies "All-India".
 */
function sanitizeThresholdAction(action, question = "") {
  if (!action || typeof action !== "object") return action;
  const q = String(question || "");
  const minMm = extractThresholdMm(q);
  const thresholdQ = isThresholdListQuestion(q) || minMm != null;

  // Standalone "all-india" replies after a clarify are handled in chatService via context.
  if (!thresholdQ && minMm == null) return action;

  if (!thresholdQ) return action;

  const wantsStates = /\bstates?\b/i.test(q) && !/\bdistricts?\b/i.test(q);
  action.module = "rainfall";
  action.api_id = wantsStates ? "fetch_state_data" : "fetch_district_data";
  action.method = "POST";
  action.path = wantsStates
    ? "/api/v1/fetchStateData"
    : "/api/v1/fetchDistrictData";
  action.post_filter = action.post_filter || {};
  // Nationwide unless a specific place was named
  if (
    /\b(all[- ]?india|whole\s+india|pan[- ]?india|across\s+india|entire\s+india|country)\b/i.test(
      q
    ) ||
    (!extractCategoriesFromQuestion(q).length &&
      !action.post_filter.district_name &&
      !action.post_filter.state_name)
  ) {
    // Keep empty for all-India list; strip bogus place filters from LLM
    if (
      /\b(all[- ]?india|whole\s+india|pan[- ]?india|across\s+india|entire\s+india|country|list\s+districts?|districts?\s+with)\b/i.test(
        q
      )
    ) {
      delete action.post_filter.district_name;
      delete action.post_filter.state_name;
      delete action.post_filter.state_names;
      delete action.post_filter.name;
    }
  }

  const mm = minMm != null ? minMm : Number(action.post_process?.min_mm) || 50;
  action.post_process = {
    type: "filter_by_actual_min",
    min_mm: mm,
  };

  // No explicit date → look back 30 days so matches include their dates
  if (!questionHasExplicitDate(q)) {
    action.body = action.body || {};
    action.body.startDate = last30Start();
    action.body.endDate = today();
  }

  return action;
}

/**
 * Day-wise districts/states at/above threshold, each row includes `date`.
 */
async function fetchThresholdRowsDaywise({
  level = "district",
  startDate,
  endDate,
  minMm,
  postFilter = {},
}) {
  const start = startDate || last30Start();
  const end = endDate || today();
  const min = Number(minMm);
  if (!Number.isFinite(min)) return { rows: [], usedDate: `${start} to ${end}` };

  if (level === "state") {
    const params = [start, end, min];
    let stateClause = "";
    if (postFilter.state_name) {
      params.push(postFilter.state_name);
      stateClause = ` AND LOWER(ndd.state_name) = LOWER($${params.length}) `;
    }
    const result = await client.query(
      `
      SELECT
        TO_CHAR(dd.from_date, 'YYYY-MM-DD') AS date,
        ndd.state_name,
        ROUND(AVG(dd.actual)::numeric, 2) AS actual,
        ROUND(AVG(dd.departure)::numeric, 2) AS departure
      FROM public.district_data dd
      JOIN public.normal_district_details ndd
        ON ndd.district_code = dd.district_id
      WHERE dd.from_date = dd.to_date
        AND dd.from_date BETWEEN $1 AND $2
        AND dd.actual IS NOT NULL
        AND dd.actual >= $3
        AND dd.actual < 999
        ${stateClause}
      GROUP BY dd.from_date, ndd.state_name
      HAVING AVG(dd.actual) >= $3
      ORDER BY dd.from_date DESC, AVG(dd.actual) DESC
      LIMIT 500
      `,
      params
    );
    return {
      rows: result.rows,
      usedDate: start === end ? start : `${start} to ${end}`,
      note: `Day-wise state rainfall ≥ ${min} mm from ${start} to ${end}.`,
    };
  }

  const params = [start, end, min];
  const clauses = [];
  if (postFilter.district_name) {
    params.push(postFilter.district_name);
    clauses.push(`LOWER(ndd.district_name) = LOWER($${params.length})`);
  }
  if (postFilter.state_name) {
    params.push(postFilter.state_name);
    clauses.push(`LOWER(ndd.state_name) = LOWER($${params.length})`);
  }
  const extra = clauses.length ? ` AND ${clauses.join(" AND ")} ` : "";

  const result = await client.query(
    `
    SELECT DISTINCT ON (dd.from_date, ndd.district_code)
      TO_CHAR(dd.from_date, 'YYYY-MM-DD') AS date,
      ndd.district_name,
      ndd.state_name,
      ROUND(dd.actual::numeric, 2) AS actual,
      ROUND(dd.departure::numeric, 2) AS departure
    FROM public.district_data dd
    JOIN public.normal_district_details ndd
      ON ndd.district_code = dd.district_id
    WHERE dd.from_date = dd.to_date
      AND dd.from_date BETWEEN $1 AND $2
      AND dd.actual IS NOT NULL
      AND dd.actual >= $3
      AND dd.actual < 999
      ${extra}
    ORDER BY dd.from_date DESC, ndd.district_code, dd.actual DESC
    LIMIT 500
    `,
    params
  );

  return {
    rows: result.rows.sort((a, b) => {
      const d = String(b.date).localeCompare(String(a.date));
      if (d !== 0) return d;
      return Number(b.actual) - Number(a.actual);
    }),
    usedDate: start === end ? start : `${start} to ${end}`,
    note: `Day-wise district rainfall ≥ ${min} mm from ${start} to ${end} (each row includes its date).`,
  };
}

function applyPostProcess(rows, postProcess) {
  if (!postProcess || !Array.isArray(rows)) return rows;

  if (postProcess.type === "filter_by_departure_category") {
    const wanted = (postProcess.categories || [])
      .map(normalizeCategoryName)
      .filter(Boolean);
    return rows
      .map((r) => ({
        ...r,
        category: getDepartureCategory(r.departure),
      }))
      .filter((r) => wanted.includes(r.category));
  }

  if (postProcess.type === "rank_by_actual") {
    const limit = Math.max(1, parseInt(postProcess.limit, 10) || 10);
    const order = String(postProcess.order || "desc").toLowerCase() === "asc"
      ? "asc"
      : "desc";
    const scored = rows
      .map((r) => ({
        ...r,
        _rank_actual: Number(
          r.actual ?? r.actual_rainfall ?? r.rainfall ?? r.avg_actual ?? NaN
        ),
      }))
      .filter((r) => Number.isFinite(r._rank_actual) && r._rank_actual < 999);
    scored.sort((a, b) =>
      order === "asc"
        ? a._rank_actual - b._rank_actual
        : b._rank_actual - a._rank_actual
    );
    return scored.slice(0, limit).map(({ _rank_actual, ...rest }) => rest);
  }

  if (postProcess.type === "filter_by_actual_min") {
    const minMm = Number(postProcess.min_mm);
    if (!Number.isFinite(minMm)) return rows;
    return rows.filter((r) => {
      const actual = Number(
        r.actual ?? r.actual_rainfall ?? r.rainfall ?? r.avg_actual ?? NaN
      );
      return Number.isFinite(actual) && actual >= minMm && actual < 999;
    });
  }

  if (postProcess.type === "filter_by_monsoon_activity") {
    const wanted = (postProcess.activities || [])
      .map((a) => String(a || "").trim().toLowerCase())
      .filter(Boolean);
    if (!wanted.length) return rows;
    return rows.filter((r) =>
      wanted.includes(String(r.activity || "").trim().toLowerCase())
    );
  }

  if (postProcess.type === "filter_by_spatial_category") {
    const wanted = (postProcess.categories || [])
      .map((a) => String(a || "").trim().toLowerCase())
      .filter(Boolean);
    if (!wanted.length) return rows;
    return rows.filter((r) => {
      const cat = String(r.category || r.spatial || "").trim().toLowerCase();
      return wanted.includes(cat);
    });
  }

  return rows;
}

/**
 * Flatten monsoon activity keyed objects into row arrays for filtering/answers.
 */
function normalizeApiRows(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return data;

  const values = Object.values(data);
  if (!values.length) return [];

  // Monsoon today: { "12": { name, activity, ... }, ... }
  if (
    values.every(
      (v) =>
        v &&
        typeof v === "object" &&
        !Array.isArray(v) &&
        (v.activity != null || (v.name != null && v.days == null))
    )
  ) {
    return Object.entries(data).map(([code, row]) => ({
      code,
      subdiv_name: row.name,
      district_name: row.name,
      ...row,
    }));
  }

  // Monsoon history: { "12": { name, days: [...] }, ... }
  if (
    values.every(
      (v) =>
        v &&
        typeof v === "object" &&
        !Array.isArray(v) &&
        Array.isArray(v.days)
    )
  ) {
    return Object.entries(data).map(([code, row]) => ({
      code,
      name: row.name,
      subdiv_name: row.name,
      district_name: row.name,
      days: row.days,
    }));
  }

  return data;
}

function normalizeQuery(query = {}) {
  const out = {};
  for (const [k, v] of Object.entries(query || {})) {
    out[k] = typeof v === "string" ? replaceDateTokens(v) : v;
  }
  return out;
}

function questionHasExplicitDate(question) {
  const q = String(question || "");
  if (!q.trim()) return false;
  return (
    /\b(today|todays|yesterday|yesterdays|tomorrow|this\s+week|last\s+week|last\s+\d+\s+days?|past\s+\d+\s+days?|this\s+month|last\s+month|monthly|seasonal|season(\s+so\s+far)?|cumulative|historical|history|so\s+far|till\s+date|to\s+date)\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    ) ||
    /\b\d{4}-\d{2}-\d{2}\b/.test(q) ||
    /\b\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?\b/.test(q) ||
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(
      q
    )
  );
}

/**
 * Clear enough period for category checks (Large Excess, Deficient, …).
 * Bare "july" / "at july" is NOT enough — user should pick Today / month / etc.
 */
function hasClearCategoryPeriod(question) {
  // Ignore the "specific_month" picker token when judging a real period
  const q = String(question || "")
    .replace(/\bspecific[_\s-]?month\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!q) return false;

  if (
    /\b(today|todays|yesterday|yesterdays|this\s+week|last\s+week|last\s+\d+\s+days?|past\s+\d+\s+days?|this\s+month|last\s+month)\b/i.test(
      q
    )
  ) {
    return true;
  }
  if (/\b\d{4}-\d{2}-\d{2}\b/.test(q)) return true;
  if (/\b\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?\b/.test(q)) return true;
  if (
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    )
  ) {
    return true;
  }
  if (
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(
      q
    )
  ) {
    return true;
  }
  // Explicit whole-month phrasing: "month of March 2024" or "March 2024"
  if (
    /\b(month\s+of|during|throughout)\s+(the\s+)?(month\s+of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    )
  ) {
    return true;
  }
  if (
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+\d{4}\b/i.test(
      q
    )
  ) {
    return true;
  }
  return false;
}

/** Detect a bare month mention like "at july" / "in june". */
function extractBareMonthMention(question) {
  const q = String(question || "");
  const m = q.match(
    /\b(?:at|in|for|during)?\s*(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+(\d{4}))?\b/i
  );
  if (!m) return null;
  // Ignore if a day number is attached
  if (
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(
      q
    )
  ) {
    return null;
  }
  const raw = m[1];
  const year = m[2] ? Number(m[2]) : moment().year();
  const key = raw.toLowerCase();
  const names = {
    january: "January",
    jan: "January",
    february: "February",
    feb: "February",
    march: "March",
    mar: "March",
    april: "April",
    apr: "April",
    may: "May",
    june: "June",
    jun: "June",
    july: "July",
    jul: "July",
    august: "August",
    aug: "August",
    september: "September",
    sept: "September",
    sep: "September",
    october: "October",
    oct: "October",
    november: "November",
    nov: "November",
    december: "December",
    dec: "December",
  };
  const label = names[key];
  if (!label) return null;
  return {
    label: `${label} ${year}`,
    value: `month of ${label} ${year}`,
    month: label,
    year,
  };
}

/**
 * Heal common LLM mistakes so category filters still work.
 * Also applies category intent parsed from the user question.
 */
function sanitizeRainfallAction(action, question = "") {
  if (!action || typeof action !== "object") return action;

  const filter = { ...(action.post_filter || {}) };
  let postProcess = action.post_process || null;
  const collected = [];

  const pullCategories = (value) => {
    if (value == null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach(pullCategories);
      return;
    }
    const normalized = normalizeCategoryName(value);
    if (
      normalized &&
      [
        "Large Excess",
        "Excess",
        "Normal",
        "Deficient",
        "Large Deficient",
        "No Rain",
        "No Data",
      ].includes(normalized) &&
      !collected.includes(normalized)
    ) {
      collected.push(normalized);
    }
  };

  for (const key of [
    "departure_category",
    "category",
    "categories",
    "departure_categories",
  ]) {
    if (filter[key] != null) {
      pullCategories(filter[key]);
      delete filter[key];
    }
  }

  if (
    postProcess &&
    postProcess.type === "filter_by_departure_category" &&
    Array.isArray(postProcess.categories)
  ) {
    postProcess.categories.forEach(pullCategories);
  }

  // Question text is source of truth for category intent (LLM often drops or invents it)
  // Do not overwrite ranking / threshold / monsoon / spatial post_process types.
  const keepPostProcess =
    postProcess &&
    [
      "rank_by_actual",
      "filter_by_actual_min",
      "filter_by_monsoon_activity",
      "filter_by_spatial_category",
    ].includes(postProcess.type);

  const fromQuestion = extractCategoriesFromQuestion(question);
  if (!keepPostProcess && fromQuestion.length) {
    postProcess = {
      type: "filter_by_departure_category",
      categories: fromQuestion,
    };
  } else if (!keepPostProcess && collected.length) {
    postProcess = {
      type: "filter_by_departure_category",
      categories: collected,
    };
  }

  if (postProcess?.type === "filter_by_departure_category") {
    // Place + category questions are district/state row filters, not country aggregates
    if (
      !action.api_id ||
      action.api_id === "fetch_country_data" ||
      action.api_id === "fetch_cumulative_country_data"
    ) {
      if (filter.district_name || filter.district_code) {
        action.api_id = "fetch_district_data";
        action.path = "/api/v1/fetchDistrictData";
        action.method = "POST";
      } else if (filter.state_name || filter.state_names) {
        action.api_id = "fetch_state_data";
        action.path = "/api/v1/fetchStateData";
        action.method = "POST";
      } else if (!action.api_id || String(action.api_id).includes("country")) {
        action.api_id = "fetch_district_data";
        action.path = "/api/v1/fetchDistrictData";
        action.method = "POST";
      }
    }
  }

  action.post_filter = filter;
  action.post_process = postProcess;
  return action;
}

/**
 * If the user did not mention any date, do not keep hallucinated catalog ranges
 * (e.g. 2026-07-01..2026-07-15 copied from few-shot examples).
 * Relative phrases (today / yesterday / last 7 days / this month) always win.
 */
function sanitizeDatesFromQuestion(action, question) {
  if (!action || typeof action !== "object") return action;
  if (!action.body || typeof action.body !== "object") action.body = {};

  const finish = () => {
    const apiId = String(action.api_id || "");
    if (apiId.startsWith("get_monsoon_activity")) {
      action.body.date =
        action.body.date || action.body.endDate || action.body.startDate || today();
    }
    if (apiId.startsWith("get_spatial_distribution")) {
      action.query = action.query || {};
      if (!action.query.startDate && !action.query.endDate) {
        action.query.startDate = action.body.startDate || today();
        action.query.endDate = action.body.endDate || action.query.startDate;
      }
    }
    return action;
  };

  const q = String(question || "");

  // Explicit calendar day in the question always wins (e.g. "25th July")
  const explicitDay = parseExplicitDayFromQuestion(q);
  if (explicitDay) {
    action.body.startDate = explicitDay;
    action.body.endDate = explicitDay;
    return finish();
  }
  const hasAbsoluteCalendar =
    /\b\d{4}-\d{2}-\d{2}\b/.test(q) ||
    /\b\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?\b/.test(q) ||
    /\b\d{1,2}(st|nd|rd|th)?\s+(of\s+)?(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(st|nd|rd|th)?\b/i.test(
      q
    ) ||
    /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{4}\b/i.test(
      q
    );

  if (!questionHasExplicitDate(q)) {
    // Threshold lists without a date → look back 30 days (day-wise rows include dates)
    if (
      isThresholdListQuestion(q) ||
      action.post_process?.type === "filter_by_actual_min"
    ) {
      action.body.startDate = last30Start();
      action.body.endDate = today();
      return finish();
    }
    action.body.startDate = today();
    action.body.endDate = today();
    return finish();
  }

  if (!hasAbsoluteCalendar) {
    if (/\byesterday\b/i.test(q)) {
      action.body.startDate = yesterday();
      action.body.endDate = yesterday();
      return finish();
    }
    if (/\b(last\s+7\s+days|past\s+7\s+days|this\s+week)\b/i.test(q)) {
      action.body.startDate = last7Start();
      action.body.endDate = today();
      return finish();
    }
    if (/\bthis\s+month\b/i.test(q) || /\bmonthly\b/i.test(q)) {
      action.body.startDate = moment().startOf("month").format("YYYY-MM-DD");
      action.body.endDate = today();
      return finish();
    }
    if (/\blast\s+month\b/i.test(q)) {
      const start = moment().subtract(1, "month").startOf("month");
      action.body.startDate = start.format("YYYY-MM-DD");
      action.body.endDate = start.clone().endOf("month").format("YYYY-MM-DD");
      return finish();
    }
    // Historical / seasonal / monsoon-to-date → SW monsoon season start → today
    if (
      /\b(historical|history|seasonal|cumulative|season\s+so\s+far|monsoon\s+so\s+far|so\s+far)\b/i.test(
        q
      ) ||
      /\bseason\b/i.test(q)
    ) {
      action.body.startDate = seasonStart();
      action.body.endDate = today();
      return finish();
    }
    if (/\btoday\b/i.test(q)) {
      action.body.startDate = today();
      action.body.endDate = today();
      return finish();
    }
  }

  return finish();
}

function roundNum(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null;
  return Number(Number(value).toFixed(digits));
}

/**
 * Local DB often has null new_state_code, so live fetchStateData can return [].
 * Fallback: aggregate district_data for the state name.
 */
async function fallbackStateFromDistrictCache(stateName, startDate, endDate) {
  if (!stateName) return { rows: [], note: null, usedDate: startDate };

  let usedDate = startDate;
  let note = null;

  const q = async (date) => {
    const result = await client.query(
      `
      SELECT
        MIN(ndd.state_name) AS state_name,
        AVG(dd.actual)::float8 AS actual_state_rainfall,
        AVG(dd.departure)::float8 AS departure,
        COUNT(*)::int AS district_rows
      FROM public.district_data dd
      JOIN public.normal_district_details ndd
        ON ndd.district_code = dd.district_id
      WHERE dd.from_date = $1
        AND dd.to_date = $1
        AND LOWER(ndd.state_name) = LOWER($2)
        AND dd.departure IS NOT NULL
      GROUP BY LOWER(ndd.state_name)
      `,
      [date, stateName]
    );
    return result.rows;
  };

  let rows = await q(startDate);

  // If asking for today/single day with no data, use latest available date for that state
  if (
    (!rows.length || rows[0].district_rows === 0) &&
    startDate === endDate
  ) {
    const latest = await client.query(
      `
      SELECT TO_CHAR(MAX(dd.from_date), 'YYYY-MM-DD') AS d
      FROM public.district_data dd
      JOIN public.normal_district_details ndd
        ON ndd.district_code = dd.district_id
      WHERE dd.from_date = dd.to_date
        AND dd.departure IS NOT NULL
        AND LOWER(ndd.state_name) = LOWER($1)
      `,
      [stateName]
    );
    const latestDate = latest.rows[0]?.d;
    if (latestDate && latestDate !== startDate) {
      rows = await q(latestDate);
      if (rows.length) {
        usedDate = latestDate;
        note = `No usable state API data for ${startDate}; used district_data cache for ${latestDate}.`;
      }
    }
  }

  if (!rows.length) return { rows: [], note, usedDate };

  const row = rows[0];
  return {
    rows: [
      {
        state_name: row.state_name,
        state_code: null,
        actual_state_rainfall: roundNum(row.actual_state_rainfall),
        rainfall_normal_value: null,
        departure: roundNum(row.departure),
        category: getDepartureCategory(row.departure),
        source: "district_data_fallback",
        date: usedDate,
      },
    ],
    note,
    usedDate,
  };
}

async function fallbackDistrictsFromCache(startDate, endDate, postFilter, postProcess) {
  let usedDate = startDate === endDate ? startDate : `${startDate} to ${endDate}`;
  let note = null;

  const fetchForRange = async (from, to) => {
    const result = await client.query(
      `
      SELECT
        MIN(ndd.district_name) AS district_name,
        dd.district_id AS district_code,
        MIN(ndd.state_name) AS state_name,
        MIN(ndd.new_state_code) AS state_code,
        dd.actual AS actual_rainfall,
        dd.departure
      FROM public.district_data dd
      LEFT JOIN public.normal_district_details ndd
        ON ndd.district_code = dd.district_id
      WHERE dd.from_date = $1
        AND dd.to_date = $2
        AND dd.district_id IS NOT NULL
      GROUP BY dd.district_id, dd.actual, dd.departure
      ORDER BY MIN(ndd.district_name)
      `,
      [from, to]
    );
    return result.rows.map((r) => ({
      ...r,
      actual_rainfall: roundNum(r.actual_rainfall),
      departure: roundNum(r.departure),
      category: getDepartureCategory(r.departure),
    }));
  };

  let rows = await fetchForRange(startDate, endDate);
  const usable = rows.some((r) => r.departure != null);

  // Only fall back to latest single day when the request was for one day
  if (!usable && startDate === endDate) {
    const latest = await client.query(`
      SELECT TO_CHAR(MAX(from_date), 'YYYY-MM-DD') AS d
      FROM public.district_data
      WHERE from_date = to_date AND departure IS NOT NULL
    `);
    const latestDate = latest.rows[0]?.d;
    if (latestDate && latestDate !== startDate) {
      rows = await fetchForRange(latestDate, latestDate);
      usedDate = latestDate;
      note = `No usable district API data for ${startDate}; used district_data cache for ${latestDate}.`;
    }
  }

  rows = applyPostFilter(rows, postFilter || {});
  rows = applyPostProcess(rows, postProcess || null);
  return { rows, note, usedDate };
}

/**
 * Navigation: no HTTP — return product name + frontend route.
 */
function executeNavigationAction(action) {
  const productName = action.product_name || null;
  const routePath = action.route_path || null;
  return {
    ok: Boolean(routePath),
    status: routePath ? 200 : 404,
    request: { method: "NAV", url: null, body: null, query: null },
    raw: null,
    data: [
      {
        product_name: productName,
        route_path: routePath,
      },
    ],
    note: routePath
      ? null
      : "Product route not found in navigation catalog.",
    usedDate: null,
  };
}

/**
 * Stations in a district for a date (or date range sum).
 */
async function queryStationsForDistrict(districtName, startDate, endDate) {
  const name = String(districtName || "").trim();
  if (!name || !startDate) return [];
  const end = endDate || startDate;
  const sameDay = startDate === end;
  try {
    const result = await client.query(
      sameDay
        ? `
      SELECT ndd.district_name,
             ndd.state_name,
             sd.station_code,
             sd.station_name,
             TO_CHAR(sdd.collection_date, 'YYYY-MM-DD') AS date,
             CASE
               WHEN sdd.data IS NULL OR sdd.data = -999.9 THEN NULL
               ELSE ROUND(sdd.data::numeric, 2)
             END AS actual_rainfall,
             sdd.data
      FROM public.station_details sd
      JOIN public.station_daily_data_updates sdd
        ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details ndd
        ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date = $1::date
        AND sd.flag != 0
        AND LOWER(ndd.district_name) = LOWER($2)
      ORDER BY sd.station_name
      `
        : `
      SELECT ndd.district_name,
             ndd.state_name,
             sd.station_code,
             sd.station_name,
             $1::text || ' to ' || $2::text AS date,
             ROUND(SUM(
               CASE
                 WHEN sdd.data IS NULL OR sdd.data = -999.9 THEN NULL
                 ELSE sdd.data::numeric
               END
             ), 2) AS actual_rainfall
      FROM public.station_details sd
      JOIN public.station_daily_data_updates sdd
        ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details ndd
        ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date BETWEEN $1::date AND $2::date
        AND sd.flag != 0
        AND LOWER(ndd.district_name) = LOWER($3)
      GROUP BY ndd.district_name, ndd.state_name, sd.station_code, sd.station_name
      ORDER BY sd.station_name
      `,
      sameDay ? [startDate, name] : [startDate, end, name]
    );
    return result.rows || [];
  } catch (err) {
    console.error("[ollamaChat] queryStationsForDistrict:", err.message);
    return [];
  }
}

/**
 * One station by name for a date.
 */
async function queryStationByName(stationName, startDate, endDate) {
  const name = String(stationName || "").trim();
  if (!name || !startDate) return [];
  const end = endDate || startDate;
  try {
    const result = await client.query(
      `
      SELECT ndd.district_name,
             ndd.state_name,
             sd.station_code,
             sd.station_name,
             TO_CHAR(sdd.collection_date, 'YYYY-MM-DD') AS date,
             CASE
               WHEN sdd.data IS NULL OR sdd.data = -999.9 THEN NULL
               ELSE ROUND(sdd.data::numeric, 2)
             END AS actual_rainfall,
             sdd.data
      FROM public.station_details sd
      JOIN public.station_daily_data_updates sdd
        ON sdd.station_id = sd.station_code
      JOIN public.normal_district_details ndd
        ON ndd.district_code = sdd.district_code
      WHERE sdd.collection_date BETWEEN $1::date AND $2::date
        AND sd.flag != 0
        AND LOWER(sd.station_name) = LOWER($3)
      ORDER BY sdd.collection_date DESC
      LIMIT 30
      `,
      [startDate, end, name]
    );
    return result.rows || [];
  } catch (err) {
    console.error("[ollamaChat] queryStationByName:", err.message);
    return [];
  }
}

/**
 * Same calendar date across previous years for a district (actual rainfall).
 */
async function fetchSameDateHistoryDistrict(districtName, monthDay, years = 5) {
  const name = String(districtName || "").trim();
  const md = String(monthDay || "").trim(); // MM-DD
  if (!name || !/^\d{2}-\d{2}$/.test(md)) return [];
  const rows = [];
  const thisYear = moment().year();
  for (let y = thisYear; y >= thisYear - years + 1; y -= 1) {
    const date = `${y}-${md}`;
    if (moment(date, "YYYY-MM-DD", true).isAfter(moment(), "day")) continue;
    try {
      const result = await client.query(
        `
        SELECT TO_CHAR(dd.from_date, 'YYYY-MM-DD') AS date,
               ndd.district_name,
               ndd.state_name,
               ROUND(dd.actual::numeric, 2) AS actual,
               ROUND(dd.actual::numeric, 2) AS actual_rainfall,
               ROUND(dd.normal::numeric, 2) AS normal,
               ROUND(dd.departure::numeric, 2) AS departure,
               $2::int AS year
        FROM public.district_data dd
        JOIN public.normal_district_details ndd
          ON ndd.district_code = dd.district_id
        WHERE dd.from_date = dd.to_date
          AND dd.from_date = $1::date
          AND LOWER(ndd.district_name) = LOWER($3)
        LIMIT 1
        `,
        [date, y, name]
      );
      if (result.rows?.[0]) {
        rows.push({ ...result.rows[0], _level: "history" });
      } else {
        rows.push({
          date,
          year: y,
          district_name: name,
          actual: null,
          actual_rainfall: null,
          _level: "history",
          note: "no data",
        });
      }
    } catch (_) {
      /* skip year */
    }
  }
  return rows;
}

async function fetchSameDateHistoryStation(stationName, monthDay, years = 5) {
  const name = String(stationName || "").trim();
  const md = String(monthDay || "").trim();
  if (!name || !/^\d{2}-\d{2}$/.test(md)) return [];
  const rows = [];
  const thisYear = moment().year();
  for (let y = thisYear; y >= thisYear - years + 1; y -= 1) {
    const date = `${y}-${md}`;
    if (moment(date, "YYYY-MM-DD", true).isAfter(moment(), "day")) continue;
    const dayRows = await queryStationByName(name, date, date);
    if (dayRows[0]) {
      rows.push({ ...dayRows[0], year: y, _level: "history" });
    } else {
      rows.push({
        date,
        year: y,
        station_name: name,
        actual_rainfall: null,
        _level: "history",
        note: "no data",
      });
    }
  }
  return rows;
}

function isSameDateHistoryQuestion(question) {
  const q = String(question || "");
  return (
    /\b(same\s+date|same\s+day|previous\s+years?|past\s+years?|last\s+\d+\s+years?|histor(?:y|ical))\b/i.test(
      q
    ) &&
    /\b(rainfall|rain)\b/i.test(q)
  );
}

/**
 * Named station → fetch_station_data; history → same_date_history post_process.
 */
function sanitizePlaceLevelAction(action, question = "") {
  if (!action || typeof action !== "object") return action;
  const q = String(question || "");

  if (isSameDateHistoryQuestion(q)) {
    action.post_process = {
      ...(action.post_process || {}),
      type: "same_date_history",
      years: 5,
    };
    action.reason = action.reason || "Same-date rainfall for previous years";

    // Ensure place filter from phrasing like "for Chennai district on 20 August"
    if (!action.post_filter?.district_name && !action.post_filter?.station_name) {
      const distM = q.match(
        /\b(?:for|of)\s+([A-Za-z][A-Za-z\s&.']{1,40}?)\s+district\b/i
      );
      const stM = q.match(
        /\b(?:for|of|at)\s+([A-Za-z][A-Za-z0-9\s&.']{1,40}?)\s+station\b/i
      );
      if (stM) {
        action.post_filter = { ...(action.post_filter || {}), station_name: stM[1].trim() };
        action.api_id = "fetch_station_data";
        action.path = "/api/v1/fetchStationData";
        action.method = "POST";
      } else if (distM) {
        action.post_filter = {
          ...(action.post_filter || {}),
          district_name: distM[1].trim(),
        };
        action.api_id = "fetch_district_data";
        action.path = "/api/v1/fetchDistrictData";
        action.method = "POST";
      }
    }

    // Calendar day from "on 20 August" / "on August 20"
    const day = parseExplicitDayFromQuestion(q);
    if (day) {
      action.body = action.body || {};
      action.body.startDate = day;
      action.body.endDate = day;
      action.body.Date = day;
    }
  }

  const stationCue =
    /\bstation\b/i.test(q) &&
    !/\b(stations?\s+(?:with|that|which|recorded|reported)|how many stations|missing stations|station count|station level data|station statistics)\b/i.test(
      q
    );

  if (stationCue && !isHighestRainfallQuestion(q)) {
    let stationName =
      action.post_filter?.station_name ||
      action.post_filter?.name ||
      null;
    if (!stationName) {
      const m =
        q.match(
          /\b(?:at|for|of)\s+([A-Za-z][A-Za-z0-9\s&.']{1,40}?)\s+station\b/i
        ) ||
        q.match(
          /\bstation\s+([A-Za-z][A-Za-z0-9\s&.']{1,40}?)(?:\s+(?:today|yesterday|rainfall|rain|on|for)\b|[?.!,]|$)/i
        );
      if (m) stationName = m[1].trim();
    }
    if (stationName) {
      action.module = "rainfall";
      action.api_id = "fetch_station_data";
      action.method = "POST";
      action.path = "/api/v1/fetchStationData";
      action.post_filter = { station_name: stationName };
      if (action.post_process?.type !== "same_date_history") {
        action.post_process = null;
      }
      action.body = action.body || {};
      if (!action.body.Date && action.body.startDate) {
        action.body.Date = action.body.startDate;
      }
      action.reason = `Station rainfall for ${stationName}`;
    }
  }

  return action;
}

/**
 * Follow-up chips after a place-specific rainfall answer.
 */
function buildRelatedOptions({
  placeName,
  placeType = "district",
  date = null,
} = {}) {
  const name = String(placeName || "").trim();
  if (!name) return [];
  const typeWord = placeType === "station" ? "station" : "district";
  const refDate = date ? moment(date, "YYYY-MM-DD") : moment();
  const dayLabel = refDate.isValid()
    ? refDate.format("D MMMM")
    : moment().format("D MMMM");
  return [
    {
      label: "Previous few days",
      value: `Rainfall for ${name} ${typeWord} for the last 7 days`,
    },
    {
      label: "Same date in previous years",
      value: `Historical rainfall for ${name} ${typeWord} on ${dayLabel} for previous years`,
    },
  ];
}

function extractRelatedPlaceContext(action, apiResult) {
  if (!action || action.post_process?.type === "rank_by_actual") return null;
  if (action.post_process?.type === "filter_by_actual_min") return null;
  if (action.post_process?.type === "filter_by_departure_category") return null;

  const station =
    action.post_filter?.station_name ||
    (Array.isArray(apiResult?.data) &&
      apiResult.data.find((r) => r._level === "station")?.station_name);
  const district =
    action.post_filter?.district_name ||
    (Array.isArray(apiResult?.data) &&
      apiResult.data.find((r) => r._level === "district" || r.district_name)
        ?.district_name);

  const date =
    apiResult?.usedDate && !String(apiResult.usedDate).includes(" to ")
      ? apiResult.usedDate
      : action.body?.startDate || action.body?.Date || today();

  if (station && action.api_id === "fetch_station_data") {
    return { placeName: station, placeType: "station", date };
  }
  if (district && action.api_id === "fetch_district_data") {
    return { placeName: district, placeType: "district", date };
  }
  if (action.post_process?.type === "same_date_history") {
    if (station) return { placeName: station, placeType: "station", date };
    if (district) return { placeName: district, placeType: "district", date };
  }
  return null;
}

async function enrichDistrictWithStations(action, apiResult) {
  if (action?.api_id !== "fetch_district_data") return apiResult;
  if (action.post_process && action.post_process.type !== "same_date_history") {
    return apiResult;
  }
  if (action.post_process?.type === "same_date_history") return apiResult;
  const district = action.post_filter?.district_name;
  if (!district) return apiResult;
  if (!Array.isArray(apiResult?.data) || apiResult.data.length === 0) {
    return apiResult;
  }

  const districtRows = apiResult.data.filter(
    (r) => !r._level || r._level === "district"
  );
  if (!districtRows.length) return apiResult;
  const start = action.body?.startDate || today();
  const end = action.body?.endDate || start;
  const stations = await queryStationsForDistrict(district, start, end);
  const primary = {
    ...districtRows[0],
    _level: "district",
  };
  const stationRows = stations.map((s) => ({
    ...s,
    actual: s.actual_rainfall != null ? Number(s.actual_rainfall) : null,
    _level: "station",
  }));
  return {
    ...apiResult,
    ok: apiResult.ok !== false,
    data: [primary, ...stationRows],
    place_level: "district",
    stations_count: stationRows.length,
  };
}

async function resolveStationOrHistoryResult(action, apiResult) {
  const body = action.body || {};
  const start = body.startDate || body.Date || today();
  const end = body.endDate || start;

  if (action.post_process?.type === "same_date_history") {
    const md = moment(start, "YYYY-MM-DD").format("MM-DD");
    const years = Math.max(
      2,
      Math.min(10, parseInt(action.post_process.years, 10) || 5)
    );
    if (action.post_filter?.station_name) {
      const rows = await fetchSameDateHistoryStation(
        action.post_filter.station_name,
        md,
        years
      );
      return {
        ok: true,
        status: 200,
        request: apiResult?.request || null,
        raw: { success: true, data: rows },
        data: rows,
        note: `Same calendar date (${md}) for the last ${years} years (station).`,
        usedDate: md,
        category_miss: null,
        place_level: "station",
      };
    }
    const district = action.post_filter?.district_name;
    if (district) {
      const rows = await fetchSameDateHistoryDistrict(district, md, years);
      return {
        ok: true,
        status: 200,
        request: apiResult?.request || null,
        raw: { success: true, data: rows },
        data: rows,
        note: `Same calendar date (${md}) for the last ${years} years (district).`,
        usedDate: md,
        category_miss: null,
        place_level: "district",
      };
    }
  }

  if (action.api_id === "fetch_station_data") {
    const stationName = action.post_filter?.station_name;
    if (stationName) {
      const rows = await queryStationByName(stationName, start, end);
      const mapped = rows.map((r) => ({
        ...r,
        actual: r.actual_rainfall != null ? Number(r.actual_rainfall) : null,
        _level: "station",
      }));
      if (
        mapped.length ||
        !Array.isArray(apiResult?.data) ||
        !apiResult.data.length
      ) {
        return {
          ok: true,
          status: 200,
          request: apiResult?.request || {
            method: "POST",
            url: null,
            body,
            query: {},
          },
          raw: { success: true, data: mapped },
          data: mapped,
          note: mapped.length
            ? null
            : `No station rainfall found for ${stationName} on ${
                start === end ? start : `${start} to ${end}`
              }.`,
          usedDate: start === end ? start : `${start} to ${end}`,
          category_miss: null,
          place_level: "station",
        };
      }
      const filtered = applyPostFilter(apiResult.data, {
        station_name: stationName,
      }).map((r) => ({ ...r, _level: "station" }));
      return { ...apiResult, data: filtered, place_level: "station" };
    }
  }

  return apiResult;
}

/**
 * Execute one allowlisted API action decided by the LLM.
 */
async function executeApiAction(action) {
  const resolved = resolveAllowedApi(action);
  if (!resolved) {
    const err = new Error(`API not allowed: ${action?.api_id || "(missing)"}`);
    err.statusCode = 400;
    throw err;
  }

  const apiId = resolved.apiId;
  const allowed = resolved.allowed;
  // Heal hallucinated api_id when path/method already matched.
  action.api_id = apiId;

  const method = String(action.method || allowed.method).toUpperCase();
  if (method === "NAV" || apiId === "resolve_product_route") {
    return executeNavigationAction(action);
  }

  const path = action.path || allowed.path;

  if (path !== allowed.path || method !== allowed.method) {
    const err = new Error(
      `Path/method mismatch for ${apiId}. Expected ${allowed.method} ${allowed.path}`
    );
    err.statusCode = 400;
    throw err;
  }

  const port = process.env.PORT || 3000;
  const apiBase =
    process.env.IRAINS_API_BASE_URL || `http://127.0.0.1:${port}`;
  const url = `${apiBase}${path}`;

  const body = method === "POST" ? normalizeBody(action.body || {}) : undefined;
  const query = normalizeQuery(action.query || {});

  // Station / same-date history: resolve from DB (avoid all-India station dump)
  if (
    action.post_process?.type === "same_date_history" ||
    apiId === "fetch_station_data"
  ) {
    action.body = body || action.body || {};
    return resolveStationOrHistoryResult(action, {
      ok: true,
      status: 200,
      request: { method, url, body, query },
      raw: null,
      data: [],
      note: null,
      usedDate: null,
      category_miss: null,
    });
  }

  // Threshold lists: day-wise DB rows with dates (not single-day aggregate API)
  if (
    action.post_process?.type === "filter_by_actual_min" &&
    (apiId === "fetch_district_data" || apiId === "fetch_state_data")
  ) {
    const tw = await fetchThresholdRowsDaywise({
      level: apiId === "fetch_state_data" ? "state" : "district",
      startDate: body?.startDate,
      endDate: body?.endDate,
      minMm: action.post_process.min_mm,
      postFilter: action.post_filter || {},
    });
    return {
      ok: true,
      status: 200,
      request: {
        method: "DAYWISE_THRESHOLD",
        url: null,
        body,
        query: {},
      },
      raw: { success: true, data: tw.rows },
      data: tw.rows,
      note: tw.note,
      usedDate: tw.usedDate,
      category_miss: null,
    };
  }

  const response = await axios({
    method,
    url,
    data: body,
    params: query,
    timeout: 120000,
    validateStatus: () => true,
  });

  let data = response.data?.data ?? response.data;
  data = normalizeApiRows(data);
  let note = null;
  let categoryMiss = null;
  let usedDate =
    body?.startDate && body?.endDate && body.startDate !== body.endDate
      ? `${body.startDate} to ${body.endDate}`
      : body?.startDate ||
        body?.date ||
        (query.startDate && query.endDate && query.startDate !== query.endDate
          ? `${query.startDate} to ${query.endDate}`
          : query.startDate || query.date) ||
        null;

  if (Array.isArray(data)) {
    data = applyPostFilter(data, action.post_filter || {});
    const beforeCategory = data;
    data = applyPostProcess(data, action.post_process || null);
    if (
      Array.isArray(beforeCategory) &&
      beforeCategory.length > 0 &&
      Array.isArray(data) &&
      data.length === 0 &&
      action.post_process?.type === "filter_by_departure_category"
    ) {
      const row = beforeCategory[0];
      const departure = row.departure;
      categoryMiss = {
        name:
          row.district_name ||
          row.state_name ||
          row.subdiv_name ||
          row.name ||
          null,
        departure: departure != null ? Number(departure) : null,
        category: getDepartureCategory(departure),
        wanted: action.post_process.categories || [],
      };
    }
  }

  // Fallbacks for empty live rainfall responses (local DB gaps)
  if (Array.isArray(data) && data.length === 0 && method === "POST") {
    if (apiId === "fetch_state_data") {
      const names = Array.isArray(action.post_filter?.state_names)
        ? action.post_filter.state_names
        : action.post_filter?.state_name
          ? [action.post_filter.state_name]
          : [];
      if (names.length) {
        const merged = [];
        const notes = [];
        for (const stateName of names) {
          const fb = await fallbackStateFromDistrictCache(
            stateName,
            body.startDate,
            body.endDate
          );
          merged.push(...fb.rows);
          if (fb.note) notes.push(fb.note);
          if (fb.usedDate) usedDate = fb.usedDate;
        }
        data = merged;
        note = notes.length ? notes.join(" ") : null;
      }
    } else if (apiId === "fetch_district_data") {
      const fb = await fallbackDistrictsFromCache(
        body.startDate,
        body.endDate,
        action.post_filter,
        action.post_process
      );
      data = fb.rows;
      note = fb.note;
      usedDate = fb.usedDate;
      if (
        (!data || !data.length) &&
        action.post_process?.type === "filter_by_departure_category" &&
        (action.post_filter?.district_name || action.post_filter?.state_name)
      ) {
        // Re-check without category to explain the miss
        const unfiltered = await fallbackDistrictsFromCache(
          body.startDate,
          body.endDate,
          action.post_filter,
          null
        );
        if (unfiltered.rows?.length) {
          const row = unfiltered.rows[0];
          categoryMiss = {
            name:
              row.district_name ||
              row.state_name ||
              row.name ||
              null,
            departure: row.departure != null ? Number(row.departure) : null,
            category: row.category || getDepartureCategory(row.departure),
            wanted: action.post_process.categories || [],
          };
          if (unfiltered.usedDate) usedDate = unfiltered.usedDate;
        }
      }
    }
  }

  let result = {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    request: { method, url, body, query },
    raw: response.data,
    data,
    note,
    usedDate,
    category_miss: categoryMiss,
  };

  result = await enrichDistrictWithStations(action, result);
  return result;
}

module.exports = {
  executeApiAction,
  today,
  yesterday,
  last7Start,
  last30Start,
  seasonStart,
  replaceDateTokens,
  getDepartureCategory,
  normalizeBody,
  sanitizeRainfallAction,
  sanitizeThresholdAction,
  sanitizeRankingAction,
  sanitizeCompareAction,
  sanitizePlaceLevelAction,
  sanitizeDatesFromQuestion,
  applyMonthRangeFromQuestion,
  extractCategoriesFromQuestion,
  extractThresholdMm,
  isThresholdListQuestion,
  isHighestRainfallQuestion,
  isCompareQuestion,
  isSameDateHistoryQuestion,
  parseExplicitDayFromQuestion,
  questionHasExplicitDate,
  hasClearCategoryPeriod,
  extractBareMonthMention,
  normalizeCategoryName,
  buildRelatedOptions,
  extractRelatedPlaceContext,
};
