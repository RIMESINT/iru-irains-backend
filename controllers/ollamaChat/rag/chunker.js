/**
 * Heading-aware markdown chunker for the Varsha RAG index.
 *
 * Two hard rules, both learned from this corpus:
 *  1. Fenced code blocks and markdown tables are ATOMIC. IRAINS_API_CATALOG.md
 *     holds 33 fences and 119 table rows — those *are* the JSON output
 *     contracts and the API parameter specs. Half a fence teaches the planner
 *     malformed output, which is worse than not retrieving the section at all.
 *  2. Every chunk carries its heading path. That path is what makes a chunk
 *     retrievable by lexical match and what gets cited back to the user.
 */

const { estimateTokens } = require("../ollamaClient");

const TARGET_TOKENS = 750; // aim: 600-900
const MAX_TOKENS = 1200; // hard ceiling before a forced split
const OVERLAP_RATIO = 0.15;

/* ------------------------------------------------------------------ */
/* 1. Cleanup — pandoc residue is pure retrieval noise                 */
/* ------------------------------------------------------------------ */

/** Sections that exist only for print pagination and never answer a question. */
const DROP_HEADINGS = [
  /^list of figures$/i,
  /^list of tables$/i,
  /^table of contents$/i,
  /^contents$/i,
];

function cleanMarkdown(raw) {
  return (
    String(raw)
      // pandoc anchors: "# Title {#introduction .unnumbered}"
      .replace(/\s*\{#[^}]*\}/g, "")
      // pandoc image refs to extracted media, and bare image embeds
      .replace(/!\[[^\]]*\]\((?:media\/|\.\/media\/)[^)]*\)/g, "")
      .replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, "")
      // pandoc emphasis wrappers on headings: "# ***Title***" -> "# Title"
      .replace(/^(#{1,6}\s*)\*{2,3}([^*\n]+?)\*{2,3}\s*$/gm, "$1$2")
      // width/height attribute droppings
      .replace(/\{width="[^"]*"\s*height="[^"]*"\}/g, "")
      // collapse 3+ blank lines
      .replace(/\n{3,}/g, "\n\n")
  );
}

/* ------------------------------------------------------------------ */
/* 2. Block parser — fences and tables stay whole                      */
/* ------------------------------------------------------------------ */

/**
 * Split text into atomic blocks: heading | fence | table | paragraph.
 * Nothing downstream is ever allowed to cut inside one of these.
 */
function parseBlocks(text) {
  const lines = text.split("\n");
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // --- fenced code block (atomic) ---
    const fence = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0].repeat(3);
      const buf = [line];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(marker)) {
        buf.push(lines[i]);
        i++;
      }
      if (i < lines.length) {
        buf.push(lines[i]); // closing fence
        i++;
      }
      blocks.push({ kind: "fence", text: buf.join("\n") });
      continue;
    }

    // --- heading ---
    const heading = line.match(/^(#{1,6})\s+(.*\S)\s*$/);
    if (heading) {
      blocks.push({
        kind: "heading",
        level: heading[1].length,
        title: heading[2].trim(),
        text: line,
      });
      i++;
      continue;
    }

    // --- markdown table (atomic): a pipe row followed by a separator row ---
    if (
      /^\s*\|/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])
    ) {
      const buf = [line];
      i++;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      blocks.push({ kind: "table", text: buf.join("\n") });
      continue;
    }

    // --- paragraph / list run ---
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*(`{3,}|~{3,})/.test(lines[i]) &&
      !(
        /^\s*\|/.test(lines[i]) &&
        i + 1 < lines.length &&
        /^\s*\|?[\s:|-]+\|[\s:|-]*$/.test(lines[i + 1])
      )
    ) {
      buf.push(lines[i]);
      i++;
    }
    if (buf.length) {
      blocks.push({ kind: "prose", text: buf.join("\n") });
    } else {
      i++; // blank line
    }
  }

  return blocks;
}

/* ------------------------------------------------------------------ */
/* 3. Sectioniser — group blocks under their heading path              */
/* ------------------------------------------------------------------ */

function buildSections(blocks) {
  const sections = [];
  const stack = []; // [{level, title}]
  let current = null;

  const flush = () => {
    if (current && current.blocks.length) sections.push(current);
    current = null;
  };

  const open = () => {
    current = {
      headingPath: stack.map((h) => h.title),
      level: stack.length ? stack[stack.length - 1].level : 0,
      blocks: [],
    };
  };

  for (const block of blocks) {
    if (block.kind === "heading") {
      flush();
      while (stack.length && stack[stack.length - 1].level >= block.level) {
        stack.pop();
      }
      stack.push({ level: block.level, title: block.title });
      open();
      continue;
    }
    if (!current) open();
    current.blocks.push(block);
  }
  flush();

  // Drop pagination-only sections
  return sections.filter((s) => {
    const leaf = s.headingPath[s.headingPath.length - 1] || "";
    return !DROP_HEADINGS.some((re) => re.test(leaf.trim()));
  });
}

/* ------------------------------------------------------------------ */
/* 4. Packing — respect the token target, never cut a block            */
/* ------------------------------------------------------------------ */

function packBlocks(blocks) {
  const groups = [];
  let buf = [];
  let tokens = 0;

  for (const block of blocks) {
    const t = estimateTokens(block.text);

    // An atomic block bigger than the ceiling still ships whole — a complete
    // oversized JSON contract beats two broken halves.
    if (t >= MAX_TOKENS) {
      if (buf.length) {
        groups.push(buf);
        buf = [];
        tokens = 0;
      }
      groups.push([block]);
      continue;
    }

    if (tokens + t > TARGET_TOKENS && buf.length) {
      groups.push(buf);
      // carry ~15% of the previous group forward as overlap
      const overlap = [];
      let carried = 0;
      const budget = TARGET_TOKENS * OVERLAP_RATIO;
      for (let k = buf.length - 1; k >= 0; k--) {
        const bt = estimateTokens(buf[k].text);
        if (carried + bt > budget) break;
        overlap.unshift(buf[k]);
        carried += bt;
      }
      buf = [...overlap];
      tokens = carried;
    }

    buf.push(block);
    tokens += t;
  }

  if (buf.length) groups.push(buf);
  return groups;
}

/* ------------------------------------------------------------------ */
/* 5. Typing — drives retrieval boosting and access gating             */
/* ------------------------------------------------------------------ */

/** "### 1) fetch_district_data" / "### 5b) fetch_cumulative_country_data" */
const API_HEADING = /^\d+[a-z]?\)\s*([a-z_][a-z0-9_]*)/i;

/**
 * Every allowlisted api_id, used as a closed vocabulary when scanning chunk
 * bodies. Loaded lazily so the chunker stays unit-testable in isolation.
 */
let API_VOCAB = null;
function apiVocab() {
  if (API_VOCAB) return API_VOCAB;
  try {
    API_VOCAB = require("../catalogLoader").ALLOWED_API_IDS;
  } catch (_) {
    API_VOCAB = [];
  }
  return API_VOCAB;
}

/**
 * Collect allowlisted api_id values mentioned anywhere in the chunk.
 * Heading-only extraction missed the module sections (Spatial, Monsoon,
 * Coverage, IMD+AWS, Range statistics) that define their APIs in prose and
 * tables rather than under a numbered "### N) api_id" heading.
 */
function extractApiIds(text) {
  const found = [];
  for (const id of apiVocab()) {
    if (new RegExp(`\\b${id}\\b`).test(text)) found.push(id);
  }
  return found;
}

function classify({ source, headingPath, text }) {
  const path = headingPath.join(" > ");
  const leaf = headingPath[headingPath.length - 1] || "";

  if (source === "catalog") {
    const m = leaf.match(API_HEADING);
    if (m) return { type: "api_spec", api_id: m[1] };
    if (/example|training set|^Q\d+[a-z]?\s*—|cheat sheet/i.test(path)) {
      return { type: "few_shot", api_id: null };
    }
    if (/navigation/i.test(path)) return { type: "nav", api_id: null };
    if (/output contract|date rules|entity resolution|departure categories|safety rules/i.test(path)) {
      return { type: "contract", api_id: null };
    }
    return { type: "api_spec", api_id: null };
  }

  // --- technical document ---
  // The appendices are NOT interchangeable. A and B are internal reference;
  // D and E are the glossary and the IMD rainfall classification, which are
  // the best answers in the whole corpus for "what does Large Deficient mean".
  // Typing them all as "schema" hid them from every user question.
  if (/^appendix a\b|database schema reference/i.test(path)) {
    return { type: "schema", api_id: null };
  }
  if (/^appendix b\b|api endpoint reference/i.test(path)) {
    return { type: "api_spec", api_id: null };
  }
  if (/^appendix d\b|glossary/i.test(path)) {
    return { type: "glossary", api_id: null };
  }
  if (/^appendix e\b|rainfall classification/i.test(path)) {
    return { type: "glossary", api_id: null };
  }
  if (/operational workflows|^workflow \d/i.test(path)) {
    return { type: "workflow", api_id: null };
  }
  return { type: "concept", api_id: null };
}

/** Level words used by the retriever to boost the right api_spec chunks. */
const LEVELS = [
  "district",
  "state",
  "subdivision",
  "subdiv",
  "region",
  "country",
  "block",
  "station",
];

function detectLevels(text) {
  const lower = String(text).toLowerCase();
  return LEVELS.filter((lv) => lower.includes(lv));
}

/* ------------------------------------------------------------------ */
/* 6. Public API                                                       */
/* ------------------------------------------------------------------ */

/**
 * Chunk one markdown document.
 * @param {string} raw       file contents
 * @param {object} opts      { source: "catalog"|"techdoc"|..., file: "docs/x.md" }
 * @returns {Array<Chunk>}
 */
function chunkMarkdown(raw, { source, file }) {
  const cleaned = cleanMarkdown(raw);
  const sections = buildSections(parseBlocks(cleaned));
  const chunks = [];

  for (const section of sections) {
    const groups = packBlocks(section.blocks);
    groups.forEach((group, idx) => {
      const bodyText = group.map((b) => b.text).join("\n\n").trim();
      if (!bodyText) return;

      const headingPath = section.headingPath;
      const pathLine = headingPath.join(" > ");
      // Heading path is prepended to the embedded text so the vector carries
      // section identity, not just the prose inside it.
      const text = pathLine ? `${pathLine}\n\n${bodyText}` : bodyText;

      const meta = classify({ source, headingPath, text: bodyText });
      const tokens = estimateTokens(text);
      if (tokens < 12) return; // stub headings with no content

      chunks.push({
        id: `${source}:${chunks.length}`,
        source,
        file,
        heading_path: headingPath,
        heading: pathLine,
        part: groups.length > 1 ? `${idx + 1}/${groups.length}` : null,
        type: meta.type,
        api_id: meta.api_id,
        api_ids: extractApiIds(text),
        levels: detectLevels(`${pathLine} ${bodyText}`),
        has_fence: group.some((b) => b.kind === "fence"),
        has_table: group.some((b) => b.kind === "table"),
        tokens,
        text,
      });
    });
  }

  return mergeTinyChunks(chunks);
}


/* ------------------------------------------------------------------ */
/* 6b. Tiny-section merge                                              */
/* ------------------------------------------------------------------ */

const MIN_TOKENS = 80;

/**
 * A heading with one sentence under it embeds poorly — the vector is mostly
 * heading noise. Fold such sections into the previous chunk when they share a
 * parent heading and the result still fits the target.
 */
function mergeTinyChunks(chunks) {
  const out = [];
  for (const chunk of chunks) {
    const prev = out[out.length - 1];
    const sameParent =
      prev &&
      prev.source === chunk.source &&
      prev.heading_path.length &&
      chunk.heading_path.length &&
      prev.heading_path[0] === chunk.heading_path[0] &&
      prev.heading_path.slice(0, -1).join(">") ===
        chunk.heading_path.slice(0, -1).join(">");

    if (
      prev &&
      sameParent &&
      chunk.tokens < MIN_TOKENS &&
      prev.tokens + chunk.tokens <= TARGET_TOKENS &&
      !chunk.part &&
      !prev.part
    ) {
      prev.text = `${prev.text}\n\n${chunk.text}`;
      prev.tokens += chunk.tokens;
      prev.api_ids = [...new Set([...prev.api_ids, ...chunk.api_ids])];
      prev.levels = [...new Set([...prev.levels, ...chunk.levels])];
      prev.has_fence = prev.has_fence || chunk.has_fence;
      prev.has_table = prev.has_table || chunk.has_table;
      prev.merged = (prev.merged || 1) + 1;
      continue;
    }
    out.push(chunk);
  }
  // ids are positional, so renumber after merging
  return out.map((c, i) => ({ ...c, id: `${c.source}:${i}` }));
}

module.exports = {
  chunkMarkdown,
  mergeTinyChunks,
  cleanMarkdown,
  parseBlocks,
  buildSections,
  packBlocks,
  classify,
  extractApiIds,
  detectLevels,
  TARGET_TOKENS,
  MAX_TOKENS,
  MIN_TOKENS,
  LEVELS,
};
