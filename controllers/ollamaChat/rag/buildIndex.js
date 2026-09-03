#!/usr/bin/env node
/**
 * Build the Varsha RAG index.  Usage:
 *   npm run rag:build            build and write docs/rag_index.json
 *   npm run rag:build -- --dry   chunk and report, write nothing
 *
 * Run this on deploy. The index is a build artifact of the markdown sources —
 * edit a doc without rebuilding and the assistant silently answers from stale
 * content.
 */

const fs = require("fs");
const path = require("path");

const { chunkMarkdown } = require("./chunker");
const { saveIndex, fileHash } = require("./indexStore");
const { embedTexts, OLLAMA_EMBED_MODEL, isOllamaUp } = require("../ollamaClient");
const { SAMPLE_QUESTIONS } = require("../catalogLoader");

const DOCS = path.join(__dirname, "../../../docs");

const SOURCES = [
  { source: "catalog", file: "docs/IRAINS_API_CATALOG.md" },
  { source: "readonly_catalog", file: "docs/IRAINS_READONLY_API_CATALOG.md" },
  { source: "techdoc", file: "docs/IRAINS_TECHNICAL_DOCUMENT.md" },
];

const BATCH_SIZE = 32;

/**
 * The 44 curated sample questions are indexed as type "sample": labelled
 * intents for the router, NOT context for the planner. Indexed as retrievable
 * content they outranked the catalog's own worked examples on every
 * question-shaped query — short question text is a near-perfect dense match
 * for a short question — and the planner got six restatements of the question
 * instead of a single API definition.
 */
function sampleQuestionChunks() {
  const chunks = [];
  for (const [group, questions] of Object.entries(SAMPLE_QUESTIONS)) {
    questions.forEach((q, i) => {
      chunks.push({
        id: `samples:${chunks.length}`,
        source: "samples",
        file: "controllers/ollamaChat/catalogLoader.js",
        heading_path: ["Sample questions", group],
        heading: `Sample questions > ${group}`,
        part: null,
        type: "sample",
        api_id: null,
        api_ids: [],
        levels: [],
        has_fence: false,
        has_table: false,
        tokens: Math.ceil(q.length / 4),
        text: `Sample questions > ${group}\n\nExample question a user may ask: ${q}`,
      });
    });
  }
  return chunks;
}

async function main() {
  const dry = process.argv.includes("--dry");

  console.log("iRAINS RAG index builder\n");

  // ---- 1. chunk ----
  const chunks = [];
  const sources = [];
  for (const spec of SOURCES) {
    const abs = path.join(__dirname, "../../../", spec.file);
    if (!fs.existsSync(abs)) {
      console.warn(`  ! skipping missing source: ${spec.file}`);
      continue;
    }
    const raw = fs.readFileSync(abs, "utf8");
    const produced = chunkMarkdown(raw, spec);
    produced.forEach((c) => {
      c.id = `${c.source}:${chunks.length}`;
      chunks.push(c);
    });
    sources.push({ ...spec, hash: fileHash(abs), chunks: produced.length });
    console.log(
      `  ${spec.file.padEnd(42)} ${String(produced.length).padStart(4)} chunks`
    );
  }

  const samples = sampleQuestionChunks();
  samples.forEach((c) => {
    c.id = `samples:${chunks.length}`;
    chunks.push(c);
  });
  sources.push({ source: "samples", file: "controllers/ollamaChat/catalogLoader.js", hash: "n/a", chunks: samples.length });
  console.log(`  ${"SAMPLE_QUESTIONS".padEnd(42)} ${String(samples.length).padStart(4)} chunks`);

  // ---- 2. report ----
  const byType = chunks.reduce((a, c) => ((a[c.type] = (a[c.type] || 0) + 1), a), {});
  const toks = chunks.map((c) => c.tokens).sort((a, b) => a - b);
  console.log(`\n  total ${chunks.length} chunks`);
  console.log(`  by type  ${JSON.stringify(byType)}`);
  console.log(
    `  tokens   median ${toks[Math.floor(toks.length / 2)]} · p95 ${
      toks[Math.floor(toks.length * 0.95)]
    } · max ${toks[toks.length - 1]}`
  );

  const brokenFences = chunks.filter(
    (c) => ((c.text.match(/^\s*```/gm) || []).length % 2) !== 0
  );
  if (brokenFences.length) {
    console.error(`\n  FAIL: ${brokenFences.length} chunk(s) contain a split code fence.`);
    process.exit(1);
  }
  console.log("  fences   all balanced");

  if (dry) {
    console.log("\n  --dry: nothing written.");
    return;
  }

  // ---- 3. embed ----
  const up = await isOllamaUp();
  if (!up.up) {
    console.error(`\n  FAIL: Ollama is not running at ${up.baseUrl}. Start it with: ollama serve`);
    process.exit(1);
  }

  console.log(`\n  embedding with ${OLLAMA_EMBED_MODEL} ...`);
  const started = Date.now();
  const vectors = [];
  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const vecs = await embedTexts(batch.map((c) => c.text));
    vectors.push(...vecs);
    process.stdout.write(
      `\r  ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length}`
    );
  }
  const secs = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\r  embedded ${vectors.length} chunks in ${secs}s`);

  // ---- 4. write ----
  const chunkPayload = chunks.map(({ ...c }) => c);
  const { path: out, bytes } = saveIndex({
    chunks: chunkPayload,
    vectors,
    model: OLLAMA_EMBED_MODEL,
    sources,
  });
  console.log(
    `\n  wrote ${path.relative(process.cwd(), out)} (${(bytes / 1024 / 1024).toFixed(2)} MB)\n`
  );
}

main().catch((err) => {
  console.error("\nrag:build failed:", err.message);
  process.exit(1);
});
