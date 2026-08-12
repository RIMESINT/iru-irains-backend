/**
 * Sample clarification / validation layer for Varsha chat.
 * Detects typos, invalid locations, bad dates, mixed intents, and ambiguity
 * before inventing answers or calling rainfall APIs.
 */
const moment = require("moment");
const client = require("../../connection");
const {
  extractCategoriesFromQuestion,
  questionHasExplicitDate,
  hasClearCategoryPeriod,
  extractBareMonthMention,
} = require("./apiExecutor");

/** Seed master used when DB is unavailable (demo / offline). */
const SAMPLE_LOCATIONS = {
  districts: [
    "Chennai",
    "Madurai",
    "Coimbatore",
    "Salem",
    "Tiruchirappalli",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Thanjavur",
    "Pune",
    "Mumbai",
    "Nagpur",
    "Nashik",
    "Bengaluru",
    "Mysuru",
    "Hyderabad",
    "Warangal",
    "Kolkata",
    "Howrah",
    "Lucknow",
    "Kanpur",
    "Jaipur",
    "Ahmedabad",
    "Surat",
    "Patna",
    "Ranchi",
    "Bhopal",
    "Indore",
    "Thiruvananthapuram",
    "Kochi",
    "Guwahati",
    "Imphal",
    "Shillong",
    "Aizawl",
    "Dehradun",
    "Chandigarh",
    "Delhi",
  ],
  states: [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Puducherry",
    "Jammu and Kashmir",
    "Ladakh",
    "Andaman and Nicobar Islands",
    "Lakshadweep",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Chandigarh",
  ],
};

const TIME_CUES =
  /\b(today|todays|yesterday|yesterdays|tomorrow|tonight|this\s+week|last\s+week|last\s+\d+\s+days?|past\s+\d+\s+days?|this\s+month|last\s+month|monthly|seasonal|season|cumulative|forecast|historical|history|so\s+far|till\s+date|to\s+date|now|currently|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{1,2}([-/]\d{2,4})?|\d{1,2}(st|nd|rd|th)?)\b/i;

const LOCATION_PREP =
  /\b(?:in|for|of|at|on|about|regarding)\s+([A-Za-z][A-Za-z\s&.']{1,40}?)(?:\s+(?:district|state|today|todays|yesterday|yesterdays|tomorrow|tonight|monthly|historical|history|weekly|seasonal|cumulative|forecast|this|last|past|rainfall|rain|data|map|departure|normal|actual)\b|[?.!,]|$)/i;

/** e.g. "give chenai data", "give me chenai data", "show chenai rainfall" */
const LOCATION_LOOSE =
  /\b(?:give|show|get|fetch|tell)(?:\s+me)?\s+([A-Za-z][A-Za-z&.']{2,40})\s+(?:data|rainfall|rain|departure|actual|normal)\b/i;

/** Strip departure-category phrases so they are never treated as place names. */
const CATEGORY_PHRASE_RE =
  /\b(?:large\s+excesss?|excesss?|large\s+def+icients?|def+icients?|no\s*rain|no\s*data)\b/gi;

const STOP_TOKENS = new Set(
  [
    "give",
    "show",
    "get",
    "fetch",
    "tell",
    "me",
    "what",
    "whats",
    "is",
    "the",
    "a",
    "an",
    "of",
    "in",
    "for",
    "on",
    "at",
    "to",
    "from",
    "with",
    "and",
    "or",
    "data",
    "rain",
    "rainfall",
    "departure",
    "actual",
    "normal",
    "map",
    "today",
    "yesterday",
    "tomorrow",
    "week",
    "month",
    "year",
    "seasonal",
    "cumulative",
    "monthly",
    "historical",
    "history",
    "weekly",
    "forecast",
    "district",
    "districts",
    "state",
    "states",
    "please",
    "can",
    "u",
    "you",
    "was",
    "were",
    "happened",
    "happend",
    "happen",
    "large",
    "excess",
    "excesss",
    "deficient",
    "deficients",
    "no",
    "category",
    "categories",
    // Common English / query words — never treat as place typos
    "than",
    "then",
    "more",
    "most",
    "less",
    "least",
    "any",
    "many",
    "some",
    "every",
    "each",
    "that",
    "this",
    "these",
    "those",
    "which",
    "where",
    "when",
    "what",
    "whose",
    "whom",
    "who",
    "has",
    "have",
    "had",
    "having",
    "above",
    "below",
    "over",
    "under",
    "between",
    "greater",
    "higher",
    "lower",
    "heavy",
    "light",
    "high",
    "low",
    "value",
    "values",
    "amount",
    "amounts",
    "threshold",
    "there",
    "their",
    "here",
    "area",
    "areas",
    "place",
    "places",
    "name",
    "names",
    "list",
    "show",
    "find",
    "only",
    "also",
    "just",
    "about",
    "into",
    "onto",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "been",
    "being",
    "were",
    "very",
    "much",
    "such",
    "like",
    "near",
    "across",
    "among",
    "along",
    "during",
    "after",
    "before",
    "since",
    "until",
    "while",
    "still",
    "already",
    "again",
    "other",
    "another",
    "same",
    "different",
    "total",
    "average",
    "maximum",
    "minimum",
    "max",
    "min",
    "mm",
    "cms",
    "cm",
    "inches",
    "inch",
    "january",
    "jan",
    "february",
    "feb",
    "march",
    "mar",
    "april",
    "apr",
    "may",
    "june",
    "jun",
    "july",
    "jul",
    "august",
    "aug",
    "september",
    "sept",
    "sep",
    "october",
    "oct",
    "november",
    "nov",
    "december",
    "dec",
    "st",
    "nd",
    "rd",
    "th",
    "india",
    "country",
    "all",
  ].map((s) => s.toLowerCase())
);

const MONTH_NUM = {
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
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

let locationCache = null;
let locationCacheAt = 0;
const CACHE_TTL_MS = 15 * 60 * 1000;

function normalizeNameKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function levenshtein(a, b) {
  const s = String(a || "");
  const t = String(b || "");
  if (s === t) return 0;
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const prev = new Array(t.length + 1);
  const curr = new Array(t.length + 1);
  for (let j = 0; j <= t.length; j++) prev[j] = j;
  for (let i = 1; i <= s.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= t.length; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= t.length; j++) prev[j] = curr[j];
  }
  return prev[t.length];
}

function similarityScore(input, candidate) {
  const a = normalizeNameKey(input);
  const b = normalizeNameKey(candidate);
  if (!a || !b) return 0;
  if (a === b) return 1;
  // Substring boost only for near-complete containment of longer tokens.
  // Avoid "than" ⊂ "thane" / "Thane" false positives.
  if (a.includes(b) || b.includes(a)) {
    const shorter = Math.min(a.length, b.length);
    const longer = Math.max(a.length, b.length);
    const ratio = shorter / longer;
    if (shorter >= 5 && ratio >= 0.8) return 0.92;
  }
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return maxLen ? 1 - dist / maxLen : 0;
}

async function loadLocationMaster() {
  const now = Date.now();
  if (locationCache && now - locationCacheAt < CACHE_TTL_MS) {
    return locationCache;
  }

  const master = {
    districts: [...SAMPLE_LOCATIONS.districts],
    states: [...SAMPLE_LOCATIONS.states],
  };

  try {
    const withTimeout = (promise, ms) =>
      Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("location master timeout")), ms)
        ),
      ]);

    const [districts, states] = await withTimeout(
      Promise.all([
        client.query(`
          SELECT DISTINCT district_name
          FROM public.normal_district_details
          WHERE district_name IS NOT NULL
          ORDER BY district_name
        `),
        client.query(`
          SELECT DISTINCT state_name
          FROM public.normal_district_details
          WHERE state_name IS NOT NULL
          ORDER BY state_name
        `),
      ]),
      2500
    );
    if (districts.rows?.length) {
      master.districts = districts.rows.map((r) => r.district_name).filter(Boolean);
    }
    if (states.rows?.length) {
      master.states = states.rows.map((r) => r.state_name).filter(Boolean);
    }
  } catch (_) {
    // Keep sample seed if DB lookup fails or times out.
  }

  locationCache = master;
  locationCacheAt = now;
  return master;
}

function fuzzyFindLocation(rawName, master, { minScore = 0.72 } = {}) {
  const input = String(rawName || "").trim();
  if (!input) return null;

  const pools = [
    ...master.districts.map((name) => ({ name, type: "district" })),
    ...master.states.map((name) => ({ name, type: "state" })),
  ];

  let best = null;
  for (const item of pools) {
    const score = similarityScore(input, item.name);
    if (!best || score > best.score) {
      best = { ...item, score, input };
    }
  }

  if (!best || best.score < minScore) return null;
  return best;
}

function scrubCategoryPhrases(question) {
  return String(question || "")
    .replace(CATEGORY_PHRASE_RE, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanExtractedPlace(raw) {
  let place = String(raw || "").trim().replace(/\s+/g, " ");
  // Cut off trailing date / month / period / filler phrases ("goa monthly", "chenai at july")
  place = place
    .replace(CATEGORY_PHRASE_RE, " ")
    .replace(/\s+month\s+of\s+.*$/i, "")
    .replace(
      /\s+(?:at|in|for|on|during|of)\s+(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec|\d).*$/i,
      ""
    )
    .replace(
      /\s+(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+\d{4})?$/i,
      ""
    )
    .replace(
      /\s+(?:today|todays|yesterday|yesterdays|tomorrow|tonight|monthly|historical|history|weekly|seasonal|cumulative|forecast|this\s+month|last\s+month|last\s+\d+\s+days?|past\s+\d+\s+days?)\b.*$/i,
      ""
    )
    .replace(/\b(district|state|ut|rainfall|rain|data|map)\b$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (place.length < 2) return null;
  if (/^(today|yesterday|india|country|all india|the|a|an|no)$/i.test(place)) {
    return null;
  }
  if (STOP_TOKENS.has(place.toLowerCase())) return null;
  // Drop trailing stop tokens ("goa monthly" → "goa")
  const parts = place
    .split(/\s+/)
    .filter((p) => p && !STOP_TOKENS.has(p.toLowerCase()));
  if (!parts.length) return null;
  if (parts.every((p) => STOP_TOKENS.has(p.toLowerCase()))) return null;
  return parts.join(" ");
}

function extractMentionedLocation(question) {
  // Remove "no rain" / "large excess" first so "data of no rain" ≠ place "no"
  const q = scrubCategoryPhrases(question);
  if (!q) return null;

  // Prefer "give me X data" over prep phrases ("of …") which often latch onto categories
  const patterns = [LOCATION_LOOSE, LOCATION_PREP];
  for (const re of patterns) {
    const m = q.match(re);
    if (!m) continue;
    const raw = cleanExtractedPlace(m[1]);
    if (raw) return raw;
  }
  return null;
}

/**
 * Scan question tokens/phrases for a near-match location typo
 * (covers "give chenai data on july 17th 2026").
 */
function findLocationTypoInQuestion(question, master, { minScore = 0.72 } = {}) {
  const q = String(question || "").trim();
  if (!q || !master) return null;

  // Threshold / listing questions without a place cue should not invent a district
  // ("any district that has more than 40mm" must not become "Thane").
  const looksLikeThresholdQuery =
    /\b(more|less|greater|higher|lower|above|below|over|under|at\s+least|at\s+most)\s+than\b/i.test(
      q
    ) ||
    /\b(more|less|greater|higher|above|below|over)\s+than\s+\d+/i.test(q) ||
    /\b(any|which|list|find|show)\s+districts?\b/i.test(q);
  const hasPlaceCue =
    LOCATION_PREP.test(q) ||
    LOCATION_LOOSE.test(scrubCategoryPhrases(q)) ||
    /\b(in|for|at|on|about)\s+[A-Za-z]{3,}/i.test(q);
  if (looksLikeThresholdQuery && !hasPlaceCue) {
    return null;
  }

  const words = (q.match(/[A-Za-z][A-Za-z']+/g) || []).filter(
    (w) => w.length >= 4 && !STOP_TOKENS.has(w.toLowerCase()) && !/^\d+$/.test(w)
  );

  // Prefer longer phrases first (e.g. "tamil nadu"), but never glue
  // category/stop words into a place n-gram ("chennai deficient").
  const candidates = [];
  for (let i = 0; i < words.length; i++) {
    candidates.push(words[i]);
    if (
      i + 1 < words.length &&
      !STOP_TOKENS.has(words[i].toLowerCase()) &&
      !STOP_TOKENS.has(words[i + 1].toLowerCase())
    ) {
      candidates.push(`${words[i]} ${words[i + 1]}`);
    }
    if (
      i + 2 < words.length &&
      !STOP_TOKENS.has(words[i].toLowerCase()) &&
      !STOP_TOKENS.has(words[i + 1].toLowerCase()) &&
      !STOP_TOKENS.has(words[i + 2].toLowerCase())
    ) {
      candidates.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
  }

  let best = null;
  for (const raw of candidates) {
    if (STOP_TOKENS.has(raw.toLowerCase())) continue;
    const match = fuzzyFindLocation(raw, master, { minScore });
    if (!match) continue;
    const exact = normalizeNameKey(match.name) === normalizeNameKey(raw);
    if (exact) continue; // already spelled correctly
    if (!best || match.score > best.score) {
      best = {
        from: raw,
        to: match.name,
        type: match.type,
        score: match.score,
        prefixAnswer: `Did you mean ${match.name}?`,
      };
    }
  }

  return best && best.score >= minScore ? best : null;
}

function titleCasePlace(name) {
  return String(name || "")
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function formatDidYouMeanPrefix(name) {
  return `Did you mean ${titleCasePlace(name)}?`;
}

function buildCategoryPeriodOptions(question) {
  const options = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 days", value: "last 7 days" },
    { label: "This month", value: "this month" },
    { label: "Last month", value: "last month" },
    { label: "Specific month", value: "specific_month" },
  ];
  const bareMonth = extractBareMonthMention(question);
  if (bareMonth) {
    const exists = options.some(
      (o) => String(o.label).toLowerCase() === String(bareMonth.label).toLowerCase()
    );
    if (!exists) {
      options.splice(options.length - 1, 0, {
        label: bareMonth.label,
        value: bareMonth.value,
      });
    }
  }
  return options;
}

/** Recent / customizable month chips for "Specific month". */
function buildRecentMonthOptions(question = "", { count = 12 } = {}) {
  const options = [];
  const seen = new Set();

  // Honor an explicit year in the question (e.g. "2023") for customization
  const yearMatch = String(question || "").match(/\b(20\d{2})\b/);
  const focusYear = yearMatch ? Number(yearMatch[1]) : null;

  if (focusYear) {
    for (let month = 0; month < 12; month++) {
      const m = moment({ year: focusYear, month, day: 1 });
      const label = m.format("MMMM YYYY");
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ label, value: `month of ${label}` });
    }
  } else {
    for (let i = 0; i < count; i++) {
      const m = moment().subtract(i, "month");
      const label = m.format("MMMM YYYY");
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      options.push({ label, value: `month of ${label}` });
    }
  }

  // Year shortcuts so users can jump to another year, then pick the month
  const currentYear = moment().year();
  for (const y of [currentYear, currentYear - 1, currentYear - 2]) {
    options.push({
      label: `Year ${y}`,
      value: `specific_month ${y}`,
    });
  }

  return options;
}

/** Yes/No confirmation before using a fuzzy-corrected place name. */
function buildDidYouMeanClarify({ from, to, locationType = "district", extra = {} } = {}) {
  const pretty = titleCasePlace(to);
  return buildClarifyResponse({
    type: "did_you_mean",
    prompt: formatDidYouMeanPrefix(to),
    answer: `${formatDidYouMeanPrefix(to)}\nPlease confirm to continue.`,
    options: [
      { label: "Yes", value: "yes", suggested_name: to, type: locationType },
      { label: "No", value: "no" },
    ],
    suggestion: to,
    extra: {
      input: from,
      from,
      to,
      location: pretty,
      location_type: locationType,
      ...extra,
    },
  });
}


function hasTimeCue(question) {
  return TIME_CUES.test(String(question || ""));
}

function findInvalidDateInQuestion(question) {
  const q = String(question || "");

  // Named month + day
  const named1 = q.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)(?:\s+(\d{4}))?\b/i
  );
  if (named1) {
    const day = Number(named1[1]);
    const month = MONTH_NUM[named1[2].toLowerCase()];
    const year = named1[3] ? Number(named1[3]) : moment().year();
    const m = moment({ year, month: month - 1, day });
    if (!m.isValid() || m.date() !== day || m.month() !== month - 1) {
      return named1[0];
    }
  }

  const named2 = q.match(
    /\b(january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s*,?\s*(\d{4}))?\b/i
  );
  if (named2) {
    const month = MONTH_NUM[named2[1].toLowerCase()];
    const day = Number(named2[2]);
    const year = named2[3] ? Number(named2[3]) : moment().year();
    const m = moment({ year, month: month - 1, day });
    if (!m.isValid() || m.date() !== day || m.month() !== month - 1) {
      return named2[0];
    }
  }

  const iso = q.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    const m = moment({ year, month: month - 1, day });
    if (!m.isValid() || m.date() !== day || m.month() !== month - 1) {
      return iso[0];
    }
  }

  const dmy = q.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (dmy) {
    const day = Number(dmy[1]);
    const month = Number(dmy[2]);
    let year = Number(dmy[3]);
    if (year < 100) year += 2000;
    const m = moment({ year, month: month - 1, day });
    if (!m.isValid() || m.date() !== day || m.month() !== month - 1) {
      return dmy[0];
    }
  }

  return null;
}

function findSuspiciousRainfallValue(question) {
  const q = String(question || "");
  // User already confirmed an unusually high value — do not loop.
  if (/\bconfirmed_rainfall_mm\b/i.test(q)) return null;

  const m = q.match(/\b(\d{3,6}(?:\.\d+)?)\s*(mm|millimet(?:er|re)s?)\b/i);
  if (!m) return null;
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return null;
  // Daily rainfall above ~500 mm is rare; above 1000 mm is almost always a typo/unit error.
  if (value >= 1000) {
    const suggestion = value >= 10000 ? value / 1000 : value / 100;
    return {
      value,
      unit: "mm",
      suggestion: Number(suggestion.toFixed(1)),
      raw: m[0],
    };
  }
  return null;
}

function isMixedConceptQuestion(question) {
  const q = String(question || "").toLowerCase();
  const hasRain = /\b(rain|rainfall|precipitation|precip)\b/.test(q);
  const hasTemp = /\b(temp|temperature|hot|cold|celsius|fahrenheit|°c|°f)\b/.test(q);
  return hasRain && hasTemp;
}

function isRainfallDataQuestion(question) {
  const q = String(question || "");
  return (
    /\b(rain|rainfall|precipitation|departure|deficient|excess|large\s+excess|large\s+deficient)\b/i.test(
      q
    ) ||
    /\b(give|show|get|fetch)\b.+\bdata\b/i.test(q) ||
    /\bdata\b.+\b(on|for|of)\b/i.test(q)
  );
}

function buildClarifyResponse({
  type,
  answer,
  prompt,
  options = [],
  suggestion = null,
  action = null,
  extra = {},
}) {
  return {
    success: true,
    mode: "clarify",
    needs_clarification: true,
    answer,
    answer_mode: "clarify",
    action: action || {
      module: "clarify",
      api_id: `clarify_${type}`,
      method: "CLARIFY",
      path: null,
      reason: type,
    },
    navigation: null,
    clarify: {
      type,
      prompt,
      options,
      suggestion,
      ...extra,
    },
    api: {
      ok: true,
      status: 200,
      request: null,
      row_count: 0,
      note: `Clarification required: ${type}`,
      usedDate: null,
      data: [],
    },
  };
}

/**
 * Pre-plan validations that do not need the LLM action.
 * Returns a clarify response or null to continue.
 */
async function runPreChatClarifications(question) {
  const q = String(question || "").trim();
  if (!q) return null;

  // 5) Impossible / invalid calendar date
  const badDate = findInvalidDateInQuestion(q);
  if (badDate) {
    return buildClarifyResponse({
      type: "invalid_date",
      prompt: "Please select a valid date.",
      answer:
        `⚠️ ${badDate} isn't a valid date.\n` +
        `Please select a valid date (for example: 28 February 2026 or 2026-02-28).`,
      options: [],
      suggestion: null,
      extra: { invalid_value: badDate },
    });
  }

  // 3) Suspicious rainfall magnitude (manual / asserted values)
  const suspicious = findSuspiciousRainfallValue(q);
  if (suspicious) {
    return buildClarifyResponse({
      type: "suspicious_rainfall_value",
      prompt: "Please verify the rainfall value.",
      answer:
        `⚠️ ${suspicious.value} mm appears to be an unusually high rainfall value.\n` +
        `Please verify the value. Did you mean ${suspicious.suggestion} mm?`,
      options: [
        { label: `Yes, ${suspicious.suggestion} mm`, value: suspicious.suggestion },
        { label: `Keep ${suspicious.value} mm`, value: suspicious.value },
      ],
      suggestion: suspicious.suggestion,
      extra: { original_value: suspicious.value, unit: "mm" },
    });
  }

  // 6) Mixed concepts (temperature + rainfall)
  if (isMixedConceptQuestion(q)) {
    return buildClarifyResponse({
      type: "mixed_concept",
      prompt: "Which information would you like?",
      answer:
        `I can help with rainfall for that location. Temperature is not available in this chat yet.\n` +
        `Which would you like?\n` +
        `🌡️ Temperature (not supported yet) | 🌧️ Rainfall`,
      options: [
        { label: "Temperature", value: "temperature", available: false },
        { label: "Rainfall", value: "rainfall", available: true },
      ],
    });
  }

  // Category questions (Large Excess / Deficient / …) need an explicit period
  const categories = extractCategoriesFromQuestion(q);
  const masterEarly = await loadLocationMaster();
  const placeHint = extractMentionedLocation(q);
  const hintMatch = placeHint
    ? fuzzyFindLocation(placeHint, masterEarly, { minScore: 0.72 })
    : null;
  // Always scan for typos ("chenai") — do not let a bad prep capture ("of no") skip this
  const typoMatch = findLocationTypoInQuestion(q, masterEarly, { minScore: 0.72 });

  let didYouMean = null;
  if (
    typoMatch &&
    typoMatch.from &&
    typoMatch.to &&
    normalizeNameKey(typoMatch.from) !== normalizeNameKey(typoMatch.to)
  ) {
    didYouMean = {
      from: typoMatch.from,
      to: typoMatch.to,
      type: typoMatch.type || "district",
    };
  } else if (
    hintMatch &&
    placeHint &&
    normalizeNameKey(placeHint) !== normalizeNameKey(hintMatch.name || "")
  ) {
    didYouMean = {
      from: placeHint,
      to: hintMatch.name,
      type: hintMatch.type || "district",
    };
  }

  const placeMatch = hintMatch || (typoMatch
    ? {
        name: typoMatch.to,
        type: typoMatch.type,
        score: typoMatch.score,
        input: typoMatch.from,
      }
    : null);
  // Only show a place name once confirmed / exact — never echo stop words like "No"
  const placeName =
    !didYouMean && placeMatch
      ? placeMatch.name || placeMatch.to
      : !didYouMean &&
        placeHint &&
        hintMatch &&
        normalizeNameKey(placeHint) === normalizeNameKey(hintMatch.name)
      ? hintMatch.name
      : null;

  // Typo first: ask Yes/No before period / data (chenai → Chennai)
  if (didYouMean) {
    return buildDidYouMeanClarify({
      from: didYouMean.from,
      to: didYouMean.to,
      locationType: didYouMean.type,
      extra: { categories: categories.length ? categories : undefined },
    });
  }

  // Chip "Specific month" → list months (customizable by year / typing)
  // Do NOT re-enter this once a real month was already chosen.
  if (
    categories.length &&
    /\bspecific[_\s-]?month\b/i.test(q) &&
    !hasClearCategoryPeriod(q.replace(/\bspecific[_\s-]?month\b/gi, " "))
  ) {
    const catLabel = categories.join(" / ") || "rainfall";
    const where = placeName ? ` for ${titleCasePlace(placeName)}` : "";
    const options = buildRecentMonthOptions(q, { count: 12 });
    const yearHint = (q.match(/\b(20\d{2})\b/) || [])[1];
    return buildClarifyResponse({
      type: "which_month",
      prompt: "Which month should I check?",
      answer: yearHint
        ? `Which month should I check for ${catLabel}${where}?\nShowing year ${yearHint}. Select a month below, switch year, or type a month like March 2023.`
        : `Which month should I check for ${catLabel}${where}?\nSelect a month below, choose a year, or type a month like March 2023.`,
      options,
      suggestion: placeName || null,
      extra: {
        categories,
        location: placeName || null,
        allow_free_text_month: true,
      },
    });
  }

  if (categories.length && !hasClearCategoryPeriod(q)) {
    const catLabel = categories.join(" / ");
    const where = placeName ? ` for ${titleCasePlace(placeName)}` : "";
    const options = buildCategoryPeriodOptions(q);
    return buildClarifyResponse({
      type: "ambiguous_timeframe",
      prompt: `Which period should I check for ${catLabel}?`,
      answer: `Sure — which period should I check for ${catLabel}${where}?`,
      options,
      suggestion: placeName || null,
      extra: {
        categories,
        location: placeName || null,
        location_type: placeMatch?.type || null,
      },
    });
  }

  // Location-related checks (1, 2, 4)
  if (!isRainfallDataQuestion(q)) return null;

  const master = masterEarly;

  // Prefer explicit "in/for/give X data" / "on chenai" mention; else fuzzy-scan tokens
  let mentioned = placeHint || extractMentionedLocation(q);
  let match = mentioned
    ? fuzzyFindLocation(mentioned, master, { minScore: 0.55 })
    : null;

  if (!mentioned) {
    const typo = findLocationTypoInQuestion(q, master, { minScore: 0.72 });
    if (typo) {
      return buildDidYouMeanClarify({
        from: typo.from,
        to: typo.to,
        locationType: typo.type,
      });
    }
    return null;
  }

  // Exact / near-exact match
  const isExact =
    match &&
    (normalizeNameKey(match.name) === normalizeNameKey(mentioned) || match.score >= 0.98);

  // 2) Invalid location
  if (!match || match.score < 0.72) {
    const examples = master.districts.slice(0, 4).join(", ");
    return buildClarifyResponse({
      type: "invalid_location",
      prompt: "Please enter a valid district or state name.",
      answer:
        `⚠️ I couldn't find a ${/district/i.test(q) ? "district" : "location"} named ${mentioned}.\n` +
        `Please enter a valid name, such as ${examples}.`,
      options: master.districts.slice(0, 6).map((name) => ({
        label: name,
        value: name,
        type: "district",
      })),
      suggestion: match && match.score >= 0.55 ? match.name : null,
      extra: { input: mentioned },
    });
  }

  // 1) Spelling mistake → Yes / No before continuing
  if (!isExact && match.score >= 0.72) {
    return buildDidYouMeanClarify({
      from: mentioned,
      to: match.name,
      locationType: match.type,
    });
  }

  // 4) Ambiguous timeframe when place is known but no time cue
  if (isExact && !hasTimeCue(q)) {
    return buildClarifyResponse({
      type: "ambiguous_timeframe",
      prompt: "Which rainfall information would you like?",
      answer:
        `Sure! Which rainfall information would you like for ${match.name}?\n` +
        `Choose a period below to continue.`,
      options: [
        { label: "Today", value: "today" },
        { label: "Yesterday", value: "yesterday" },
        { label: "This month", value: "this month" },
        { label: "Season so far", value: "season so far" },
      ],
      suggestion: match.name,
      extra: { location: match.name, location_type: match.type },
    });
  }

  return null;
}

/**
 * If the planner put a state into district_name (or vice versa), fix api + filter.
 */
function healPlaceFilterLevel(action, master) {
  if (!action || !master) return action;
  if (!action.post_filter || typeof action.post_filter !== "object") return action;

  const filter = action.post_filter;
  if (filter.district_name) {
    const asState = fuzzyFindLocation(
      filter.district_name,
      { districts: [], states: master.states },
      { minScore: 0.88 }
    );
    const asDistrict = fuzzyFindLocation(
      filter.district_name,
      { districts: master.districts, states: [] },
      { minScore: 0.88 }
    );
    if (asState && (!asDistrict || asState.score > asDistrict.score)) {
      filter.state_name = asState.name;
      delete filter.district_name;
      action.api_id = "fetch_state_data";
      action.path = "/api/v1/fetchStateData";
      action.method = "POST";
    }
  } else if (filter.state_name) {
    const asDistrict = fuzzyFindLocation(
      filter.state_name,
      { districts: master.districts, states: [] },
      { minScore: 0.92 }
    );
    const asState = fuzzyFindLocation(
      filter.state_name,
      { districts: [], states: master.states },
      { minScore: 0.88 }
    );
    if (asDistrict && (!asState || asDistrict.score > asState.score)) {
      filter.district_name = asDistrict.name;
      delete filter.state_name;
      action.api_id = "fetch_district_data";
      action.path = "/api/v1/fetchDistrictData";
      action.method = "POST";
    }
  }

  action.post_filter = filter;
  return action;
}

/**
 * After the planner returns an action, validate / correct location filters.
 * Returns clarify response, soft correction meta, or null.
 */
async function runPostPlanLocationClarifications(question, action) {
  if (!action || action.module === "navigation") return null;

  const master = await loadLocationMaster();
  action = healPlaceFilterLevel(action, master);

  const filter = action.post_filter || {};
  const candidates = [];
  if (filter.district_name) candidates.push({ key: "district_name", value: filter.district_name, type: "district" });
  if (filter.state_name) candidates.push({ key: "state_name", value: filter.state_name, type: "state" });
  if (Array.isArray(filter.state_names)) {
    filter.state_names.forEach((value, i) =>
      candidates.push({ key: `state_names[${i}]`, value, type: "state" })
    );
  }

  if (!candidates.length) {
    // No place filter on a vague rainfall question → ask which area (sample)
    const q = String(question || "");
    const typo = findLocationTypoInQuestion(q, master, { minScore: 0.72 });
    if (typo) {
      return buildDidYouMeanClarify({
        from: typo.from,
        to: typo.to,
        locationType: typo.type,
      });
    }

    // Pan-India category lists ("excess districts today") do not need a place
    const cats = extractCategoriesFromQuestion(q);
    const asksAllAreas =
      /\b(districts?|states?|which|list|all|across|pan[- ]?india)\b/i.test(q) ||
      (cats.length > 0 && !extractMentionedLocation(q));
    if (cats.length && asksAllAreas) {
      return null;
    }

    if (
      isRainfallDataQuestion(q) &&
      !extractMentionedLocation(q) &&
      !/\b(all[- ]?india|country|india|pan[- ]?india|all states)\b/i.test(q)
    ) {
      return buildClarifyResponse({
        type: "ambiguous_location",
        prompt: "Which location should I use?",
        answer:
          `🌧️ I can look up rainfall, but I need a place.\n` +
          `Please name a state or district (for example: Maharashtra, Chennai), or say "all-India".`,
        options: [
          { label: "All-India", value: "all-india" },
          { label: "Maharashtra", value: "Maharashtra", type: "state" },
          { label: "Chennai", value: "Chennai", type: "district" },
        ],
      });
    }
    return null;
  }

  // Even if the LLM already fixed the spelling in post_filter, ask Yes/No
  // when the original question still contains the typo (e.g. chenai → Chennai).
  const questionTypo = findLocationTypoInQuestion(question, master, { minScore: 0.72 });
  if (questionTypo) {
    return buildDidYouMeanClarify({
      from: questionTypo.from,
      to: questionTypo.to,
      locationType: questionTypo.type,
    });
  }

  // Re-heal after any filter edits above
  healPlaceFilterLevel(action, master);

  const corrections = [];

  for (const item of candidates) {
    const match = fuzzyFindLocation(item.value, master, { minScore: 0.55 });
    if (!match || match.score < 0.72) {
      const examples =
        item.type === "state"
          ? master.states.slice(0, 4).join(", ")
          : master.districts.slice(0, 4).join(", ");
      return buildClarifyResponse({
        type: "invalid_location",
        prompt: "Please enter a valid location name.",
        answer:
          `⚠️ I couldn't find a ${item.type} named ${item.value}.\n` +
          `Please enter a valid name, such as ${examples}.`,
        options: (item.type === "state" ? master.states : master.districts)
          .slice(0, 6)
          .map((name) => ({ label: name, value: name, type: item.type })),
        suggestion: match && match.score >= 0.55 ? match.name : null,
        extra: { input: item.value, field: item.key },
      });
    }

    if (normalizeNameKey(match.name) !== normalizeNameKey(item.value)) {
      corrections.push({
        key: item.key,
        from: item.value,
        to: match.name,
        type: match.type,
        score: match.score,
      });
    }
  }

  if (!corrections.length) return null;

  return buildDidYouMeanClarify({
    from: corrections[0].from,
    to: corrections[0].to,
    locationType: corrections[0].type,
  });
}

module.exports = {
  SAMPLE_LOCATIONS,
  loadLocationMaster,
  fuzzyFindLocation,
  findLocationTypoInQuestion,
  healPlaceFilterLevel,
  buildDidYouMeanClarify,
  buildCategoryPeriodOptions,
  buildRecentMonthOptions,
  runPreChatClarifications,
  runPostPlanLocationClarifications,
  findInvalidDateInQuestion,
  findSuspiciousRainfallValue,
  isMixedConceptQuestion,
  hasTimeCue,
  formatDidYouMeanPrefix,
};
