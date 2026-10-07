/**
 * Location resolver: question text -> a place CODE, deterministically.
 *
 * No model is involved. The order is fixed and every step is explainable:
 *
 *   1. exact spans     every 1-6 word run of the question looked up in the
 *                      registry index (names, curated aliases, variants)
 *   2. context         "Udaipur in Tripura": a second place narrows the first
 *   3. level           "Banda block": the word after the name narrows level
 *   4. strength        stored names and aliases outrank derived variants
 *   5. decide          one candidate -> resolved; several -> ask, with parents
 *   6. fuzzy           only when nothing matched exactly, only for words of
 *                      5+ letters, and never resolved silently — always
 *                      returned as "did you mean", for the user to confirm
 *
 * The old path did fuzzy matching first and repaired the planner's guesses
 * afterwards; most of September's wrong-place answers came from that order.
 */

const { norm, NOT_A_PLACE, LEVEL_WORDS, COUNTRY_RE } = require("./normalize");
const registry = require("./registry");

const MAX_SPAN = 6;

/** Tokens with their original text; "&" is read as "and". */
function tokenize(question) {
  return String(question || "")
    .replace(/&/g, " and ")
    .split(/[^A-Za-z0-9()_.'-]+/)
    .map((t) => t.replace(/^[().'-]+|[().'-]+$/g, ""))
    .filter(Boolean);
}

const isCommon = (t) => NOT_A_PLACE.has(t.toLowerCase()) || /^\d+$/.test(t);

function levelOfWord(word) {
  if (!word) return null;
  for (const [level, re] of LEVEL_WORDS) if (re.test(word)) return level;
  return null;
}

/** Every exact hit, longest span first; shorter spans inside a hit are dropped. */
function findSpans(tokens) {
  const hits = [];
  for (let len = Math.min(MAX_SPAN, tokens.length); len >= 1; len--) {
    for (let i = 0; i + len <= tokens.length; i++) {
      const words = tokens.slice(i, i + len);
      if (words.every(isCommon)) continue;
      if (len === 1 && isCommon(words[0])) continue;
      const key = norm(words.join(" "));
      if (key.length < 2) continue;
      const found = registry.lookup(key);
      if (found.length) hits.push({ start: i, end: i + len, text: words.join(" "), key, found });
    }
  }
  const kept = [];
  for (const h of hits) {
    if (!kept.some((k) => h.start < k.end && k.start < h.end)) kept.push(h);
  }
  return kept.sort((a, b) => a.start - b.start);
}

/** The level word written right after (or right before) a span, if any. */
function levelForSpan(tokens, span) {
  return levelOfWord(tokens[span.end]) || levelOfWord(tokens[span.start - 1]) || null;
}

const toCandidate = ({ entry, how }) => ({
  id: entry.id,
  level: entry.level,
  code: entry.code,
  name: entry.name,
  label: registry.label(entry),
  parents: entry.parents || {},
  how,
});

function dedupe(list) {
  const seen = new Set();
  return list.filter((c) => (seen.has(c.id) ? false : (seen.add(c.id), true)));
}

/* ------------------------------------------------------------------ */
/* fuzzy — last resort, typos only                                     */
/* ------------------------------------------------------------------ */

function levenshtein(a, b) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

/**
 * Typo candidates for phrases that matched nothing exactly. Requires 5+
 * letters: four-letter collisions ("want" vs the station MANT) are exactly
 * the noise this layer exists to keep out.
 */
function fuzzyCandidates(tokens, { level = null, limit = 4 } = {}) {
  const r = registry.load();
  const phrases = [];
  let run = [];
  const flush = () => {
    for (let len = Math.min(3, run.length); len >= 1; len--) {
      for (let i = 0; i + len <= run.length; i++) phrases.push(run.slice(i, i + len).join(" "));
    }
    run = [];
  };
  for (const t of tokens) (isCommon(t) || levelOfWord(t) ? flush() : run.push(t));
  flush();

  const scored = new Map();
  const keys = [...r.index.keys(), ...Object.keys(r.aliases)];
  for (const phrase of phrases) {
    const q = norm(phrase);
    if (q.length < 5) continue;
    const maxDist = q.length >= 9 ? 2 : 1;
    for (const k of keys) {
      if (Math.abs(k.length - q.length) > maxDist) continue;
      const d = levenshtein(q, k);
      if (d === 0 || d > maxDist) continue;
      const score = 1 - d / Math.max(q.length, k.length);
      for (const hit of registry.lookup(k)) {
        if (level && hit.entry.level !== level) continue;
        if (hit.how === "variant") continue;
        const prev = scored.get(hit.entry.id);
        if (!prev || score > prev.score) {
          scored.set(hit.entry.id, { ...toCandidate(hit), score: Number(score.toFixed(3)), typed: phrase });
        }
      }
    }
  }
  return [...scored.values()]
    .sort((a, b) => b.score - a.score || registry.RANK[b.level] - registry.RANK[a.level])
    .slice(0, limit);
}

/* ------------------------------------------------------------------ */
/* decide                                                              */
/* ------------------------------------------------------------------ */

/**
 * Pick among the candidates for one span.
 *
 * crossLevel: "prefer_largest" resolves "Banda" to the one district called
 * Banda and returns the same-named blocks and stations as alternatives;
 * "ask" stops and asks whenever a name exists at more than one level.
 * Several candidates at the SAME level always ask — two districts called
 * Bilaspur can never be told apart by a rule.
 */
function decide(cands, { levelRequested, crossLevel }) {
  if (cands.length === 1) return { status: "resolved", target: cands[0], alternatives: [] };
  const levels = new Set(cands.map((c) => c.level));
  if (levelRequested || levels.size === 1 || crossLevel === "ask") {
    return { status: "ambiguous", candidates: cands };
  }
  const top = Math.max(...cands.map((c) => registry.RANK[c.level]));
  const largest = cands.filter((c) => registry.RANK[c.level] === top);
  const rest = cands.filter((c) => registry.RANK[c.level] !== top);
  if (largest.length === 1) return { status: "resolved", target: largest[0], alternatives: rest };
  return { status: "ambiguous", candidates: largest, alternatives: rest };
}

/**
 * @param {string} question
 * @param {object} [opts]  crossLevel: "prefer_largest" | "ask"
 * @returns {{status, target?, targets?, candidates?, alternatives?, levelRequested?, context?, spans, reason}}
 */
function resolve(question, { crossLevel = process.env.LOCATION_CROSS_LEVEL || "prefer_largest" } = {}) {
  const tokens = tokenize(question);
  const spans = findSpans(tokens).map((s) => ({
    ...s,
    level: levelForSpan(tokens, s),
    cands: dedupe(s.found.map(toCandidate)),
  }));
  const debugSpans = spans.map((s) => ({ text: s.text, level: s.level, n: s.cands.length }));

  // ---- context: a span whose candidates CONTAIN another span's candidates
  const contextOf = new Map();
  for (const a of spans) {
    for (const b of spans) {
      if (a === b) continue;
      const contained = a.cands.some((ca) =>
        b.cands.some((cb) => ca.id !== cb.id && registry.isWithin(registry.get(ca.id), registry.get(cb.id)))
      );
      if (contained) (contextOf.get(a) || contextOf.set(a, []).get(a)).push(b);
    }
  }
  const contextSpans = new Set([...contextOf.values()].flat());
  const targets = spans.filter((s) => !contextSpans.has(s) || contextOf.has(s));
  const targetSpans = targets.filter((s) => !(contextSpans.has(s) && !contextOf.has(s)));

  if (!targetSpans.length) {
    if (COUNTRY_RE.test(String(question))) {
      return { status: "country", target: { id: "country:IN", level: "country", code: "IN", name: "INDIA", label: "INDIA (country)" }, spans: debugSpans, reason: "all-India" };
    }
    const fuzzy = fuzzyCandidates(tokens);
    if (fuzzy.length) return { status: "did_you_mean", candidates: fuzzy, spans: debugSpans, reason: "no exact match; closest spellings" };
    return { status: "none", spans: debugSpans, reason: "no place named" };
  }

  const resolved = [];
  for (const span of targetSpans) {
    let cands = span.cands;
    const ctx = (contextOf.get(span) || []).flatMap((c) => c.cands);
    let contextMismatch = false;

    if (ctx.length) {
      const inside = cands.filter((c) => ctx.some((x) => registry.isWithin(registry.get(c.id), registry.get(x.id))));
      if (inside.length) cands = inside;
      else contextMismatch = true;
    }

    if (span.level) {
      const atLevel = cands.filter((c) => c.level === span.level);
      if (!atLevel.length) {
        const near = fuzzyCandidates(tokenize(span.text), { level: span.level });
        return {
          status: "level_mismatch",
          levelRequested: span.level,
          typed: span.text,
          candidates: dedupe([...cands, ...near]),
          spans: debugSpans,
          reason: `"${span.text}" is not a ${span.level} in iRAINS`,
        };
      }
      cands = atLevel;
    }

    if (cands.some((c) => c.how !== "variant")) cands = cands.filter((c) => c.how !== "variant");

    const d = decide(cands, { levelRequested: span.level, crossLevel });
    if (d.status !== "resolved") {
      return {
        ...d,
        typed: span.text,
        levelRequested: span.level,
        context: ctx.map((c) => c.label),
        contextMismatch,
        spans: debugSpans,
        reason: d.candidates.length > 1 && new Set(d.candidates.map((c) => c.level)).size === 1
          ? `${d.candidates.length} ${d.candidates[0].level}s are called "${span.text}"`
          : `"${span.text}" exists at more than one level`,
      };
    }
    resolved.push({ ...d.target, alternatives: d.alternatives, levelRequested: span.level, contextMismatch });
  }

  return {
    status: "resolved",
    target: resolved[0],
    targets: resolved,
    alternatives: resolved[0].alternatives || [],
    spans: debugSpans,
    reason: resolved.length > 1 ? `${resolved.length} places named` : "exact match",
  };
}

module.exports = { resolve, tokenize, findSpans, fuzzyCandidates };
