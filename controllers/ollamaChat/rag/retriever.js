/**
 * Hybrid retriever: dense (cosine) + lexical (BM25), fused with Reciprocal
 * Rank Fusion.
 *
 * Dense-only retrieval fails this corpus. Users type exact identifiers —
 * "Large Deficient", "QPF", "fetch_block_data", "MC/RMC" — and embeddings
 * blur precisely those. BM25 catches them; the embedding catches paraphrase.
 * Neither alone is sufficient.
 */

const { loadIndex, dot, normalize } = require("./indexStore");
const { embedTexts } = require("../ollamaClient");
const { LEVELS } = require("./chunker");
const { ALLOWED_API_IDS } = require("../catalogLoader");

const RRF_K = 60;
const DEFAULT_TOP_K = Number(process.env.RAG_TOP_K) || 6;
const CANDIDATES = 40; // per-arm depth before fusion

/* ------------------------------------------------------------------ */
/* Lexical arm — BM25                                                  */
/* ------------------------------------------------------------------ */

const K1 = 1.5;
const B = 0.75;

/** Keep underscores and slashes: `fetch_block_data` and `MC/RMC` are tokens. */
function tokenize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9_/]+/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

let bm25 = null;

function buildBm25(chunks) {
  const docs = chunks.map((c) => tokenize(c.text));
  const df = new Map();
  docs.forEach((terms) => {
    new Set(terms).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  });
  const N = docs.length;
  const avgdl = docs.reduce((a, d) => a + d.length, 0) / (N || 1);

  const tf = docs.map((terms) => {
    const m = new Map();
    terms.forEach((t) => m.set(t, (m.get(t) || 0) + 1));
    return m;
  });

  const idf = new Map();
  df.forEach((n, t) => {
    idf.set(t, Math.log(1 + (N - n + 0.5) / (n + 0.5)));
  });

  return { tf, idf, lens: docs.map((d) => d.length), avgdl, N };
}

function bm25Search(queryTerms, limit) {
  const scores = new Array(bm25.N).fill(0);
  for (const term of queryTerms) {
    const idf = bm25.idf.get(term);
    if (!idf) continue;
    for (let i = 0; i < bm25.N; i++) {
      const f = bm25.tf[i].get(term);
      if (!f) continue;
      const norm = 1 - B + B * (bm25.lens[i] / bm25.avgdl);
      scores[i] += idf * ((f * (K1 + 1)) / (f + K1 * norm));
    }
  }
  return scores
    .map((score, i) => ({ i, score }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* Query analysis — drives boosting                                    */
/* ------------------------------------------------------------------ */

/** Level words map to the api_id families that serve them. */
const LEVEL_HINTS = {
  district: ["district"],
  state: ["state"],
  subdivision: ["subdivision", "subdiv"],
  subdiv: ["subdivision", "subdiv"],
  region: ["region"],
  country: ["country"],
  block: ["block"],
  station: ["station"],
};

/**
 * Distinctive topic words -> the catalog module heading that serves them.
 * Several module sections share the heading "... > APIs" and read almost
 * identically to an embedding, so "spatial distribution for Kerala" was losing
 * to "Monsoon activity > APIs". Matching the topic against the heading breaks
 * that tie on the one signal that actually distinguishes them.
 */
const TOPIC_HINTS = [
  { re: /\bspatial (distribution|table)\b|\bisolated\b|\bwidespread\b|\bscattered\b/i, heading: /spatial/i },
  { re: /\bmonsoon (activity|is|status)\b|\bvigorous\b|\bsubdued\b|\bactive monsoon\b/i, heading: /monsoon/i },
  { re: /\bhow many stations\b|\breport(ed|ing)\b|\bcoverage\b|\bmissing\b|\bmc\b/i, heading: /coverage/i },
  { re: /\btop \d+\b|\bwettest\b|\bhighest\b|\branking\b|\babove \d+\b|\bheavy rainfall\b/i, heading: /ranking|extremes|heavy rainfall/i },
  { re: /\bmin\b|\bmax\b|\baverage\b|\bsummary\b|\bperiod\b/i, heading: /range statistics/i },
  { re: /\bblock\b/i, heading: /block/i },
];

function analyzeQuery(question) {
  const q = String(question || "").toLowerCase();
  const levels = LEVELS.filter((lv) => new RegExp(`\\b${lv}`).test(q));
  const apiIds = ALLOWED_API_IDS.filter((id) => q.includes(id));
  const wantsAws = /\baws\b|automatic weather|imd\s*\+\s*aws/.test(q);
  const wantsNav = /\bwhere is\b|\bopen\b|\bnavigate|\bmenu\b|\bpage\b/.test(q);
  const topics = TOPIC_HINTS.filter((t) => t.re.test(q)).map((t) => t.heading);
  return { levels, apiIds, wantsAws, wantsNav, topics };
}

/* ------------------------------------------------------------------ */
/* Pins — never left to retrieval luck                                 */
/* ------------------------------------------------------------------ */

/**
 * The JSON output contract and the date rules are not "relevant sections" to
 * be ranked; without them the planner emits malformed actions regardless of
 * what else it retrieved. They are always prepended.
 */
const PIN_PATTERNS = [/output contract/i, /date rules/i];

function pinnedChunks(chunks) {
  return chunks.filter(
    (c) => c.source === "catalog" && PIN_PATTERNS.some((re) => re.test(c.heading))
  );
}

/* ------------------------------------------------------------------ */
/* Retrieval                                                           */
/* ------------------------------------------------------------------ */

let ready = false;
let indexRef = null;

function init() {
  if (ready) return indexRef;
  indexRef = loadIndex();
  bm25 = buildBm25(indexRef.chunks);
  ready = true;
  return indexRef;
}

function isReady() {
  return ready;
}

/**
 * @param {string} question
 * @param {object} opts
 *   topK          number of fused results to return
 *   types         restrict to these chunk types
 *   excludeTypes  drop these chunk types (default: schema — internal only)
 *   sources       restrict to these source documents (e.g. ["techdoc"])
 *   pin           prepend the contract chunks (planner path only)
 * @returns {Promise<{chunks, pins, timings, analysis}>}
 */
async function retrieve(question, opts = {}) {
  const {
    topK = DEFAULT_TOP_K,
    types = null,
    sources = null,
    excludeTypes = ["schema", "sample"],
    pin = false,
  } = opts;

  const idx = init();
  const t0 = Date.now();
  const analysis = analyzeQuery(question);

  // --- dense arm ---
  const [qvecRaw] = await embedTexts([question]);
  const qvec = normalize(qvecRaw);
  const tEmbed = Date.now() - t0;

  const allowed = (c) => {
    if (types && !types.includes(c.type)) return false;
    if (sources && !sources.includes(c.source)) return false;
    if (excludeTypes && excludeTypes.includes(c.type)) return false;
    return true;
  };

  const dense = idx.chunks
    .map((c, i) => ({ i, score: allowed(c) ? dot(qvec, c.vec) : -Infinity }))
    .filter((r) => r.score > -Infinity)
    .sort((a, b) => b.score - a.score)
    .slice(0, CANDIDATES);

  // --- lexical arm ---
  const lexicalAll = bm25Search(tokenize(question), CANDIDATES * 2);
  const lexical = lexicalAll.filter((r) => allowed(idx.chunks[r.i])).slice(0, CANDIDATES);

  // --- reciprocal rank fusion ---
  const fused = new Map();
  const addArm = (results, arm) => {
    results.forEach((r, rank) => {
      const entry = fused.get(r.i) || { i: r.i, rrf: 0, dense: null, lex: null };
      entry.rrf += 1 / (RRF_K + rank + 1);
      entry[arm] = { rank: rank + 1, score: r.score };
      fused.set(r.i, entry);
    });
  };
  addArm(dense, "dense");
  addArm(lexical, "lex");

  // --- boosts ---
  for (const entry of fused.values()) {
    const chunk = idx.chunks[entry.i];
    let boost = 0;

    // The Maharashtra -> fetch_station_data class of error: when the question
    // names an administrative level, favour api_spec chunks for that level.
    if (analysis.levels.length && chunk.type === "api_spec") {
      const wanted = new Set(analysis.levels.flatMap((lv) => LEVEL_HINTS[lv] || [lv]));
      const hit = (chunk.api_ids || []).some((id) =>
        [...wanted].some((w) => id.includes(w))
      );
      if (hit) boost += 0.02;
    }

    // Explicit api_id in the question is as strong a signal as it gets.
    if (analysis.apiIds.length && (chunk.api_ids || []).some((id) => analysis.apiIds.includes(id))) {
      boost += 0.03;
    }

    // Topic match on the heading — the tie-breaker between sibling "> APIs"
    // sections that are otherwise near-identical to an embedding.
    if (analysis.topics?.length && analysis.topics.some((re) => re.test(chunk.heading))) {
      boost += 0.04;
    }

    if (analysis.wantsAws && /with_aws|aws/i.test(chunk.heading)) boost += 0.01;
    if (analysis.wantsNav && chunk.type === "nav") boost += 0.03;

    entry.boost = boost;
    entry.final = entry.rrf + boost;
  }

  const ranked = [...fused.values()].sort((a, b) => b.final - a.final).slice(0, topK);

  const chunks = ranked.map((r) => {
    const c = idx.chunks[r.i];
    return {
      id: c.id,
      source: c.source,
      file: c.file,
      heading: c.heading,
      heading_path: c.heading_path,
      type: c.type,
      api_ids: c.api_ids,
      tokens: c.tokens,
      text: c.text,
      score: Number(r.final.toFixed(5)),
      // Raw cosine is the interpretable relevance signal; RRF scores are
      // compressed and cannot be thresholded across questions.
      dense_score: r.dense?.score != null ? Number(r.dense.score.toFixed(4)) : null,
      dense_rank: r.dense?.rank ?? null,
      lex_rank: r.lex?.rank ?? null,
      boost: Number((r.boost || 0).toFixed(3)),
    };
  });

  const pins = pin ? pinnedChunks(idx.chunks).map((c) => ({
    id: c.id,
    heading: c.heading,
    type: c.type,
    tokens: c.tokens,
    text: c.text,
  })) : [];

  return {
    chunks,
    pins,
    analysis,
    timings: { embed_ms: tEmbed, total_ms: Date.now() - t0 },
  };
}

/**
 * Planner retrieval. Plain top-K is not enough here: on a question-shaped
 * query the worked examples dominate both arms and the planner can end up
 * with zero API definitions in context. Retrieve each stratum separately so
 * the prompt is guaranteed to contain actual endpoint specs.
 */
async function retrieveForPlanner(question, { topK = DEFAULT_TOP_K } = {}) {
  const specQuota = Math.max(3, Math.ceil(topK * 0.6));
  const exampleQuota = Math.max(2, topK - specQuota);

  const [specs, examples] = await Promise.all([
    retrieve(question, {
      topK: specQuota,
      types: ["api_spec", "contract", "nav"],
      excludeTypes: [],
    }),
    retrieve(question, {
      topK: exampleQuota,
      types: ["few_shot"],
      excludeTypes: [],
    }),
  ]);

  // Interleave so the model sees a definition first, then how it is used.
  const seen = new Set();
  const merged = [];
  const maxLen = Math.max(specs.chunks.length, examples.chunks.length);
  for (let i = 0; i < maxLen; i++) {
    for (const list of [specs.chunks, examples.chunks]) {
      const c = list[i];
      if (c && !seen.has(c.id)) {
        seen.add(c.id);
        merged.push(c);
      }
    }
  }

  const idx = init();
  return {
    chunks: merged.slice(0, specQuota + exampleQuota),
    pins: pinnedChunks(idx.chunks).map((c) => ({
      id: c.id,
      heading: c.heading,
      type: c.type,
      tokens: c.tokens,
      text: c.text,
    })),
    analysis: specs.analysis,
    timings: {
      embed_ms: specs.timings.embed_ms + examples.timings.embed_ms,
      total_ms: Math.max(specs.timings.total_ms, examples.timings.total_ms),
    },
  };
}

/** Render retrieved chunks as the context block handed to the model. */
function formatContext({ chunks, pins }) {
  const parts = [];
  if (pins?.length) {
    parts.push(
      "## ALWAYS-APPLY RULES\n\n" + pins.map((p) => p.text).join("\n\n---\n\n")
    );
  }
  if (chunks?.length) {
    parts.push(
      "## RETRIEVED SECTIONS\n\n" +
        chunks
          .map((c, i) => `[${i + 1}] ${c.heading}\n${c.text}`)
          .join("\n\n---\n\n")
    );
  }
  return parts.join("\n\n");
}

module.exports = {
  init,
  isReady,
  retrieve,
  retrieveForPlanner,
  formatContext,
  analyzeQuery,
  tokenize,
  buildBm25,
  DEFAULT_TOP_K,
  RRF_K,
};
