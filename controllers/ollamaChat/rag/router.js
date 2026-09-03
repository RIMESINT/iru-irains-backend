/**
 * Intent router: decide where a question goes BEFORE any planning happens.
 *
 *   data        -> API planner (rainfall numbers, rankings, coverage, monsoon)
 *   knowledge   -> technical-document RAG (how something works, what a term means)
 *   navigation  -> PRODUCT_ROUTES lookup (already deterministic, needs no model)
 *
 * Deterministic rules run first and settle most questions. Only genuinely
 * ambiguous ones reach the sample-question nearest-neighbour fallback. An LLM
 * router would be a third model call that can hallucinate a fourth destination.
 */

const { PRODUCT_ROUTES } = require("../catalogLoader");
const { loadIndex, dot, normalize } = require("./indexStore");
const { embedTexts } = require("../ollamaClient");

/* ------------------------------------------------------------------ */
/* Signals                                                             */
/* ------------------------------------------------------------------ */

const NAV_RE =
  /\b(where is|where are|where can i (find|see)|how do i (get|go) to|open the|open |navigate|which (page|menu|tab)|show me the .* (page|screen|menu))\b/i;

/** Asking about a concept, not for a number. */
/**
 * Asking about a concept, not for a number.
 *
 * Kept as a list of independent patterns rather than one joined alternation:
 * a single trailing \b applied to a big group silently killed every
 * stem-based alternative ("categor" followed by "i" is not a word boundary),
 * which routed "What are the IMD departure categories?" to the data planner.
 */
const KNOWLEDGE_PATTERNS = [
  /\bwhat (is|are|does|do) .*(mean|stands? for)/i,
  /\bwhat does .* mean\b/i,
  /\b(define|definition of|explain|describe)\b/i,
  // taxonomy questions: "What are the IMD departure categories?"
  /\bwhat (are|is) the [a-z ]*(categor|classificat|threshold|criteri|range|level|type|stack|architecture|module|component)/i,
  // "How is spatial distribution classified?"
  /\bhow (is|are) [a-z ]*(classified|categoris|categoriz|defined|determined|derived|measured|computed|calculated)/i,
  /\bhow (does|do|is|are) .*(work|works|computed|calculated|derived|generated|verified)/i,
  /\bwhy (is|does|do)\b/i,
  /\bwhat is the (purpose|difference|process|workflow|procedure)\b/i,
  /\bwho (can|is allowed)\b/i,
  /\bwhich role\b/i,
  /\b(steps to|how to use)\b/i,
];

function looksDefinitional(q) {
  return KNOWLEDGE_PATTERNS.some((re) => re.test(q));
}

/**
 * Every real data question in iRAINS carries a time reference — a rainfall
 * figure is meaningless without one. So "what is X" with no timeframe at all
 * is asking what X *means*, not what it measured.
 *
 * This is what separates "what is spatial distribution" (a definition) from
 * "what is the spatial distribution for Kerala today" (a reading), even though
 * both contain the phrase the data matcher keys on.
 */
const TIMEFRAME_RE =
  /\b(today|todays|yesterday|tomorrow|now|current|last \d+|past \d+|this (week|month|year|season)|so far|till date|to date|seasonal|cumulative|\d{4}-\d{2}-\d{2}|\d{1,2}[-/]\d{1,2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|monsoon season)\b/i;

/**
 * "what is…", "do you know…", "tell me about…" — an opener that wants a concept.
 * Deliberately typo-tolerant on "know" (knwo / kno / knw are the common
 * transpositions) because these openers are typed fast and casually.
 */
const ASKS_ABOUT_RE =
  /^\s*(?:hey |hi |ok |so )?(?:what(?:'|\u2019)?s|what is|what are|wat is|do (?:you|u|yo) (?:know|knwo|kno|knw)|(?:you|u) (?:know|knwo|kno|knw)|does (?:it|iRAINS) have|tell me about|any idea (?:about|on)|explain)\b/i;

function isConceptQuestion(q) {
  return ASKS_ABOUT_RE.test(q) && !TIMEFRAME_RE.test(q);
}

/** Asking for a rainfall value / list / ranking. */
const DATA_RE =
  /\b(rainfall|rain|actual|normal|departure|deficient|excess|mm\b|wettest|highest|lowest|top \d+|above \d+|below \d+|cumulative|seasonal|today|yesterday|last \d+ days|this week|compare|how much|how many stations|station count|spatial distribution|monsoon activity)\b/i;

/** Concepts that live in the technical document, not in any API response. */
const CONCEPT_TERMS =
  /\b(qpf|verification|workflow|architecture|dissemination|data entry|log info|role|permission|access|schema|pipeline|normals? (are|is) (computed|derived)|homogenous region|subdivision boundary|glossary|classification|terminology)\b/i;

function matchesProductAlias(q) {
  const lower = q.toLowerCase();
  return PRODUCT_ROUTES.some((p) => {
    if (lower.includes(String(p.product_name).toLowerCase())) return true;
    return (p.aliases || []).some(
      (a) => String(a).length >= 4 && lower.includes(String(a).toLowerCase())
    );
  });
}

/* ------------------------------------------------------------------ */
/* Deterministic pass                                                  */
/* ------------------------------------------------------------------ */

function ruleRoute(question) {
  const q = String(question || "").trim();
  if (!q) return null;

  const nav = NAV_RE.test(q);
  const alias = matchesProductAlias(q);
  const knowledge = looksDefinitional(q);
  const data = DATA_RE.test(q);
  const concept = CONCEPT_TERMS.test(q);

  // "Where is the daily departure map?" — navigation wins over the fact that
  // it also contains the word "departure".
  if (nav && (alias || !knowledge)) {
    return { route: "navigation", why: "navigation phrasing", confidence: 0.95 };
  }
  // Naming a product is only navigation when the user is asking WHERE it is.
  // "tell me about data entry" names the product but wants an explanation, so
  // the concept opener has to beat the bare alias match.
  if (alias && !data && !knowledge && !isConceptQuestion(q)) {
    return { route: "navigation", why: "named a product", confidence: 0.8 };
  }

  // "What does Large Deficient mean?" contains "deficient" but wants a
  // definition, not a district list — knowledge must beat the data keyword.
  if (knowledge && !/(today|yesterday|last \d+|this (week|month)|top \d+|above \d+)/i.test(q)) {
    return { route: "knowledge", why: "definitional phrasing", confidence: 0.9 };
  }
  if (concept && !data) {
    return { route: "knowledge", why: "technical-document concept", confidence: 0.85 };
  }

  // "what is spatial distribution" contains a data keyword but names no
  // timeframe, so it wants the definition, not today's reading.
  if (isConceptQuestion(q)) {
    return {
      route: "knowledge",
      why: "asks what something is, with no timeframe",
      confidence: 0.8,
    };
  }

  if (data) {
    return { route: "data", why: "rainfall data phrasing", confidence: 0.85 };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/* Fallback — nearest labelled sample question                         */
/* ------------------------------------------------------------------ */

const GROUP_TO_ROUTE = {
  rainfall: "data",
  spatial_monsoon: "data",
  navigation: "navigation",
};

let samples = null;

function loadSamples() {
  if (samples) return samples;
  const idx = loadIndex();
  samples = idx.chunks.filter((c) => c.type === "sample");
  return samples;
}

async function nearestSampleRoute(question) {
  const pool = loadSamples();
  if (!pool.length) return null;

  const [raw] = await embedTexts([question]);
  const qvec = normalize(raw);

  let best = null;
  for (const chunk of pool) {
    const score = dot(qvec, chunk.vec);
    if (!best || score > best.score) best = { chunk, score };
  }
  if (!best || best.score < 0.55) return null;

  const group = best.chunk.heading_path[1];
  const route = GROUP_TO_ROUTE[group] || "data";
  return {
    route,
    why: `nearest sample question (${group}, ${best.score.toFixed(2)})`,
    confidence: Number(best.score.toFixed(2)),
    nearest_sample: best.chunk.text.split("ask: ")[1] || null,
  };
}

/* ------------------------------------------------------------------ */

/**
 * @returns {Promise<{route:"data"|"knowledge"|"navigation", why, confidence}>}
 */
async function route(question) {
  const rule = ruleRoute(question);
  if (rule) return { ...rule, stage: "rule" };

  try {
    const near = await nearestSampleRoute(question);
    if (near) return { ...near, stage: "nearest_sample" };
  } catch (_) {
    // index unavailable — fall through
  }

  // Nothing matched: treat as knowledge so the technical document gets a shot
  // before the question is declared out of scope.
  return { route: "knowledge", why: "no signal; defaulting to document search", confidence: 0.3, stage: "default" };
}

module.exports = {
  route,
  ruleRoute,
  nearestSampleRoute,
  looksDefinitional,
  isConceptQuestion,
};
