const axios = require("axios");

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const OLLAMA_KEEP_ALIVE = parseKeepAlive(process.env.OLLAMA_KEEP_ALIVE);

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

async function isOllamaUp() {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 3000 });
    return {
      up: true,
      models: (res.data?.models || []).map((m) => m.name),
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    };
  } catch (err) {
    return {
      up: false,
      error: err.message,
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    };
  }
}

async function askOllama(
  messages,
  { temperature = 0, formatJson = false, timeout = 120000 } = {}
) {
  const payload = {
    model: OLLAMA_MODEL,
    messages,
    stream: false,
    keep_alive: OLLAMA_KEEP_ALIVE,
    options: {
      temperature,
    },
  };
  if (formatJson) {
    payload.format = "json";
  }

  const res = await axios.post(`${OLLAMA_BASE_URL}/api/chat`, payload, {
    timeout,
  });

  const content = res.data?.message?.content || "";
  return {
    content,
    raw: res.data,
    model: res.data?.model || OLLAMA_MODEL,
  };
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
  extractJsonObject,
  OLLAMA_BASE_URL,
  OLLAMA_MODEL,
  OLLAMA_KEEP_ALIVE,
};
