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
      const actual = row[key];
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
  return rows;
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
  const fromQuestion = extractCategoriesFromQuestion(question);
  if (fromQuestion.length) {
    postProcess = {
      type: "filter_by_departure_category",
      categories: fromQuestion,
    };
  } else if (collected.length) {
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

  const q = String(question || "");
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
    action.body.startDate = today();
    action.body.endDate = today();
    return action;
  }

  if (!hasAbsoluteCalendar) {
    if (/\byesterday\b/i.test(q)) {
      action.body.startDate = yesterday();
      action.body.endDate = yesterday();
      return action;
    }
    if (/\b(last\s+7\s+days|past\s+7\s+days|this\s+week)\b/i.test(q)) {
      action.body.startDate = last7Start();
      action.body.endDate = today();
      return action;
    }
    if (/\bthis\s+month\b/i.test(q) || /\bmonthly\b/i.test(q)) {
      action.body.startDate = moment().startOf("month").format("YYYY-MM-DD");
      action.body.endDate = today();
      return action;
    }
    if (/\blast\s+month\b/i.test(q)) {
      const start = moment().subtract(1, "month").startOf("month");
      action.body.startDate = start.format("YYYY-MM-DD");
      action.body.endDate = start.clone().endOf("month").format("YYYY-MM-DD");
      return action;
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
      return action;
    }
    if (/\btoday\b/i.test(q)) {
      action.body.startDate = today();
      action.body.endDate = today();
      return action;
    }
  }

  return action;
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
  const query = action.query || {};

  const response = await axios({
    method,
    url,
    data: body,
    params: query,
    timeout: 60000,
    validateStatus: () => true,
  });

  let data = response.data?.data ?? response.data;
  let note = null;
  let categoryMiss = null;
  let usedDate =
    body?.startDate && body?.endDate && body.startDate !== body.endDate
      ? `${body.startDate} to ${body.endDate}`
      : body?.startDate || null;

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

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    request: { method, url, body, query },
    raw: response.data,
    data,
    note,
    usedDate,
    category_miss: categoryMiss,
  };
}

module.exports = {
  executeApiAction,
  today,
  yesterday,
  last7Start,
  seasonStart,
  replaceDateTokens,
  getDepartureCategory,
  normalizeBody,
  sanitizeRainfallAction,
  sanitizeDatesFromQuestion,
  applyMonthRangeFromQuestion,
  extractCategoriesFromQuestion,
  questionHasExplicitDate,
  hasClearCategoryPeriod,
  extractBareMonthMention,
  normalizeCategoryName,
};
