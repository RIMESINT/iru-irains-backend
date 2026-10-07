/**
 * Product-page resolver: spelling AND meaning, never a model that can invent.
 *
 * Measured on real questions, each method fails where the other succeeds:
 *
 *   "yerlystatinstatistivs"   spelling -> Yearly Station Statistics   (right)
 *                             meaning  -> Daily Actual State Map      (wrong)
 *   "where can i see each station totals for the year"
 *                             spelling -> junk, 0.33
 *                             meaning  -> Yearly Station Statistics   (right)
 *
 * Garbled words are noise to an embedding model; different words with the
 * same meaning are invisible to edit distance. So both run, and the answer is
 * taken only when they agree, or when one is clearly confident and the other
 * has nothing to say. A close call is asked, not guessed.
 *
 * The embedding model only RANKS the fixed list of product pages, so it can
 * never return a page that does not exist — which a generating model could.
 */

const { PRODUCT_ROUTES } = require("./catalogLoader");
const { embedTexts } = require("./ollamaClient");

/** Words that carry navigation intent but no page identity. */
const FILLER = /\b(where|is|are|the|a|an|open|show|me|take|go|to|find|can|i|see|link|page|screen|menu|please|navigate|view|get|for|of|my)\b/gi;

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

function levenshtein(a, b) {
  const p = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let d = p[0];
    p[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const t = p[j];
      p[j] = Math.min(p[j] + 1, p[j - 1] + 1, d + (a[i - 1] === b[j - 1] ? 0 : 1));
      d = t;
    }
  }
  return p[b.length];
}

const cosine = (a, b) => {
  let d = 0, x = 0, y = 0;
  for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; x += a[i] * a[i]; y += b[i] * b[i]; }
  return d / Math.sqrt(x * y);
};

/** Thresholds, set from measurement — see docs/nav_eval.jsonl. */
const FUZZY_MIN = 0.75;
const FUZZY_MARGIN = 0.05;
const EMBED_MIN = 0.62;
const EMBED_MARGIN = 0.03;

let index = null;

async function loadIndex() {
  if (index) return index;
  const texts = [];
  for (const p of PRODUCT_ROUTES) {
    for (const t of [p.product_name, ...(p.aliases || [])]) texts.push({ page: p, text: t });
  }
  let vectors = null;
  try {
    vectors = await embedTexts(texts.map((t) => `search_document: ${t.text}`));
  } catch (err) {
    console.warn("[nav] embeddings unavailable, spelling only:", err.message);
  }
  index = { texts, vectors };
  return index;
}

/** Best score per page, highest first. */
function rankPages(scores) {
  const best = new Map();
  for (const { page, s } of scores) {
    const prev = best.get(page.route_path);
    if (!prev || s > prev.s) best.set(page.route_path, { page, s });
  }
  return [...best.values()].sort((a, b) => b.s - a.s);
}

/**
 * @returns {Promise<{status:"resolved"|"ask"|"none", page?, alternatives?, options?, why}>}
 */
async function resolveNavigation(question) {
  const idx = await loadIndex();
  const q = String(question || "");
  const stripped = q.replace(FILLER, " ").replace(/\s+/g, " ").trim();
  const nq = norm(stripped);
  if (nq.length < 4) return { status: "none", why: "nothing to match" };

  // spelling
  const fuzzy = rankPages(idx.texts.map(({ page, text }) => {
    const k = norm(text);
    return { page, s: 1 - levenshtein(nq, k) / Math.max(nq.length, k.length) };
  }));

  // meaning
  let embed = [];
  if (idx.vectors) {
    try {
      const [qv] = await embedTexts([`search_query: ${q}`]);
      embed = rankPages(idx.texts.map((t, i) => ({ page: t.page, s: cosine(qv, idx.vectors[i]) })));
    } catch (_) {
      embed = [];
    }
  }

  const confident = (list, min, margin) =>
    list[0] && list[0].s >= min && (!list[1] || list[0].s - list[1].s >= margin) ? list[0] : null;

  const F = confident(fuzzy, FUZZY_MIN, FUZZY_MARGIN);
  const E = confident(embed, EMBED_MIN, EMBED_MARGIN);
  const scores = {
    fuzzy: fuzzy.slice(0, 2).map((x) => [x.page.product_name, Number(x.s.toFixed(3))]),
    embed: embed.slice(0, 2).map((x) => [x.page.product_name, Number(x.s.toFixed(3))]),
  };
  const altOf = (winner) =>
    [...embed, ...fuzzy].map((x) => x.page).filter((p) => p.route_path !== winner.route_path)
      .filter((p, i, a) => a.findIndex((y) => y.route_path === p.route_path) === i).slice(0, 2);

  if (F && E && F.page.route_path === E.page.route_path) {
    return { status: "resolved", page: F.page, alternatives: altOf(F.page), why: "spelling and meaning agree", scores };
  }
  if (F && E) {
    return { status: "ask", options: [F.page, E.page], why: "spelling and meaning disagree", scores };
  }
  if (F) return { status: "resolved", page: F.page, alternatives: altOf(F.page), why: "spelling match", scores };
  if (E) return { status: "resolved", page: E.page, alternatives: altOf(E.page), why: "meaning match", scores };

  // Plausible but not confident: offer the top two rather than guess.
  const near = embed[0] && embed[0].s >= 0.58 ? embed.slice(0, 2).map((x) => x.page) : [];
  if (near.length) return { status: "ask", options: near, why: "close call", scores };
  return { status: "none", why: "no page close enough", scores };
}

module.exports = { resolveNavigation, loadIndex };
