/**
 * Persistence and in-memory access for the Varsha RAG index.
 *
 * The index is a build artifact of the markdown sources, not runtime state.
 * ~500 chunks is a sub-5ms in-memory cosine scan, so there is deliberately no
 * vector database here — see docs/RAG.md for when that changes.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const INDEX_PATH =
  process.env.RAG_INDEX_PATH ||
  path.join(__dirname, "../../../docs/rag_index.json");

const INDEX_VERSION = 1;

/* ------------------------------------------------------------------ */
/* Vector packing — float32 base64 keeps the file ~2MB instead of ~15MB */
/* ------------------------------------------------------------------ */

function packVector(vec) {
  const f32 = Float32Array.from(vec);
  return Buffer.from(f32.buffer, f32.byteOffset, f32.byteLength).toString("base64");
}

function unpackVector(b64) {
  const buf = Buffer.from(b64, "base64");
  return new Float32Array(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  );
}

/** Vectors are L2-normalised at build time so scoring is a plain dot product. */
function normalize(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  const out = new Float32Array(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
  return out;
}

function dot(a, b) {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) sum += a[i] * b[i];
  return sum;
}

function fileHash(filePath) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(filePath))
    .digest("hex")
    .slice(0, 16);
}

/* ------------------------------------------------------------------ */
/* Save / load                                                         */
/* ------------------------------------------------------------------ */

function saveIndex({ chunks, vectors, model, sources }) {
  const payload = {
    version: INDEX_VERSION,
    built_at: new Date().toISOString(),
    embed_model: model,
    dims: vectors[0]?.length || 0,
    sources,
    chunks: chunks.map((chunk, i) => ({
      ...chunk,
      vector: packVector(normalize(vectors[i])),
    })),
  };
  fs.writeFileSync(INDEX_PATH, JSON.stringify(payload));
  return { path: INDEX_PATH, bytes: fs.statSync(INDEX_PATH).size };
}

let cache = null;

/**
 * Load the index into memory. Vectors are unpacked once at boot; queries
 * then scan the resident Float32Arrays.
 */
function loadIndex({ force = false } = {}) {
  if (cache && !force) return cache;
  if (!fs.existsSync(INDEX_PATH)) {
    const err = new Error(
      `RAG index not found at ${INDEX_PATH}. Build it with: npm run rag:build`
    );
    err.code = "RAG_INDEX_MISSING";
    throw err;
  }

  const raw = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  if (raw.version !== INDEX_VERSION) {
    throw new Error(
      `RAG index version ${raw.version} != expected ${INDEX_VERSION}. Rebuild with: npm run rag:build`
    );
  }

  cache = {
    version: raw.version,
    built_at: raw.built_at,
    embed_model: raw.embed_model,
    dims: raw.dims,
    sources: raw.sources || [],
    chunks: raw.chunks.map((c) => ({ ...c, vec: unpackVector(c.vector), vector: undefined })),
  };
  return cache;
}

/** True when every source file still hashes to what the index was built from. */
function isIndexStale() {
  try {
    const idx = loadIndex();
    return (idx.sources || []).some((s) => {
      // Pseudo-sources (e.g. SAMPLE_QUESTIONS, built from code not a document)
      // carry no hash and can never be compared.
      if (!s.hash || s.hash === "n/a") return false;
      const abs = path.join(__dirname, "../../../", s.file);
      return !fs.existsSync(abs) || fileHash(abs) !== s.hash;
    });
  } catch (_) {
    return true;
  }
}

function getIndexMeta() {
  try {
    const idx = loadIndex();
    return {
      ready: true,
      built_at: idx.built_at,
      embed_model: idx.embed_model,
      dims: idx.dims,
      chunk_count: idx.chunks.length,
      sources: idx.sources,
      stale: isIndexStale(),
      path: INDEX_PATH,
    };
  } catch (err) {
    return { ready: false, error: err.message, path: INDEX_PATH };
  }
}

module.exports = {
  saveIndex,
  loadIndex,
  getIndexMeta,
  isIndexStale,
  fileHash,
  packVector,
  unpackVector,
  normalize,
  dot,
  INDEX_PATH,
  INDEX_VERSION,
};
