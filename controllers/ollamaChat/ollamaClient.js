const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_KEEP_ALIVE = parseKeepAlive(process.env.OLLAMA_KEEP_ALIVE);
const OLLAMA_EMBED_MODEL =
  process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

/**
 * Context window handed to Ollama on every chat call.
 *
 * CRITICAL: Ollama defaults num_ctx to 2048. The planner system prompt (rules +
 * IRAINS_API_CATALOG.md) is ~11k tokens, so leaving this unset made Ollama
 * silently truncate ~82% of the catalog — the model never saw the JSON output
 * contract, the date rules, the API definitions or any few-shot example, and
 * answered valid rainfall questions with invented api_id values.
 * Do not remove this without checking /ollama-chat/health context_budget.
 */
const OLLAMA_NUM_CTX = parseNumCtx(process.env.OLLAMA_NUM_CTX);

/** Rough token estimate for prompt-vs-window budgeting (~4 chars/token). */
const CHARS_PER_TOKEN = 4;

function parseKeepAlive(value) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return -1;
  }
  const raw = String(value).trim();
  if (raw === "-1") return -1;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber)) return asNumber;
  return raw;
}

function parseNumCtx(value) {
  const DEFAULT_NUM_CTX = 16384;
  const MIN_NUM_CTX = 4096;
  if (value === undefined || value === null || String(value).trim() === "") {
    return DEFAULT_NUM_CTX;
  }
  const asNumber = Number(String(value).trim());
  if (!Number.isFinite(asNumber) || asNumber <= 0) {
    console.warn(
      `[ollama] OLLAMA_NUM_CTX="${value}" is not a positive number; using ${DEFAULT_NUM_CTX}`
    );
    return DEFAULT_NUM_CTX;
  }
  if (asNumber < MIN_NUM_CTX) {
    console.warn(
      `[ollama] OLLAMA_NUM_CTX=${asNumber} is below ${MIN_NUM_CTX}; the API catalog will be truncated. Using ${MIN_NUM_CTX}.`
    );
    return MIN_NUM_CTX;
  }
  return Math.floor(asNumber);
}

/** Approximate token count for a string or a messages array. */
function estimateTokens(input) {
  if (!input) return 0;
  const text = Array.isArray(input)
    ? input.map((m) => String(m?.content || "")).join("\n")
    : String(input);
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Compare an intended prompt against the configured window.
 * Returns { fits, estimated_tokens, num_ctx, headroom }.
 */
function checkContextBudget(input) {
  const estimated = estimateTokens(input);
  return {
    fits: estimated <= OLLAMA_NUM_CTX,
    estimated_tokens: estimated,
    num_ctx: OLLAMA_NUM_CTX,
    headroom: OLLAMA_NUM_CTX - estimated,
  };
}

async function isOllamaUp() {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
    return {
      up: true,
      models: (res.data?.models || []).map((m) => m.name),
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      num_ctx: OLLAMA_NUM_CTX,
    };
  } catch (err) {
    return {
      up: false,
      error: err.message,
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
      num_ctx: OLLAMA_NUM_CTX,
    };
  }
}

async function askOllama(
  messages,
  { temperature = 0, formatJson = false, timeout = 120000, numCtx = null } = {}
) {
  const budget = checkContextBudget(messages);
  if (!budget.fits) {
    // Ollama truncates silently, so say it out loud rather than serving a
    // confidently wrong answer built from a partial prompt.
    console.warn(
      `[ollama] prompt ~${budget.estimated_tokens} tokens exceeds num_ctx ${budget.num_ctx}; ` +
        `Ollama will truncate. Raise OLLAMA_NUM_CTX or shrink the prompt (see rag/retriever.js).`
    );
  }

  const payload = {
    model: OLLAMA_MODEL,
    messages,
    stream: false,
    keep_alive: OLLAMA_KEEP_ALIVE,
    options: {
      temperature,
      num_ctx: numCtx || OLLAMA_NUM_CTX,
    },
  };
  if (formatJson) {
    payload.format = "json";
  }

  const res = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, payload, {
    timeout,
  });

  const promptEvalCount = res.data?.prompt_eval_count ?? null;
  if (
    promptEvalCount != null &&
    budget.estimated_tokens > 0 &&
    promptEvalCount < budget.estimated_tokens * 0.8
  ) {
    console.warn(
      `[ollama] prompt_eval_count=${promptEvalCount} is far below the ~${budget.estimated_tokens} tokens sent — the prompt was truncated.`
    );
  }

  const content = res.data?.message?.content || "";
  return {
    content,
    raw: res.data,
    model: res.data?.model || OLLAMA_MODEL,
    prompt_eval_count: promptEvalCount,
    num_ctx: payload.options.num_ctx,
  };
}

/**
 * Embed one or more strings. Used by the RAG index builder and retriever.
 * Returns an array of vectors aligned with `inputs`.
 */
async function embedTexts(inputs, { model = OLLAMA_EMBED_MODEL, timeout = 120000 } = {}) {
  const list = Array.isArray(inputs) ? inputs : [inputs];
  if (!list.length) return [];

  const res = await axios.post(
    `${OLLAMA_BASE_URL}/api/embed`,
    { model, input: list },
    { timeout }
  );

  const vectors = res.data?.embeddings;
  if (!Array.isArray(vectors) || vectors.length !== list.length) {
    throw new Error(
      `Embedding model "${model}" returned ${vectors?.length ?? 0} vectors for ${list.length} inputs. ` +
        `Is it pulled? Run: ollama pull ${model}`
    );
  }
  return vectors;
}

function extractJsonObject(text) {
  if (!text) return null;
  const trimmed = String(text).trim();

  // Direct JSON
  try {
    return JSON.parse(trimmed);
  } catch (_) {
    // continue
  }

  // Fenced ```json ... ```
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try {
      return JSON.parse(fenced[1].trim());
    } catch (_) {
      // continue
    }
  }

  // First {...} block
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch (_) {
      return null;
    }
  }
  return null;
}

module.exports = {
  isOllamaUp,
  askOllama,
  embedTexts,
  extractJsonObject,
  estimateTokens,
  checkContextBudget,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  OLLAMA_KEEP_ALIVE,
  OLLAMA_NUM_CTX,
  OLLAMA_EMBED_MODEL,
};
