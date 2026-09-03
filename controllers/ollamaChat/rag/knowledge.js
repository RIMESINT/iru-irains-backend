/**
 * Knowledge answers: questions about how iRAINS works and what its terms mean,
 * grounded in the technical document.
 *
 * These previously had no path at all — "How does QPF verification work?" hit
 * the planner, produced no valid api_id, and came back as "That one is outside
 * iRAINS." The corpus held the answer the whole time.
 */

const { retrieve, formatContext } = require("./retriever");
const { askOllama } = require("../ollamaClient");
const { SAMPLE_QUESTIONS } = require("../catalogLoader");

/**
 * User-facing answers come from the product documentation ONLY.
 *
 * These previously also included few_shot / contract / api_spec / nav, which
 * are the API catalog — developer material. The result was answers that
 * described our own internals back to the user ("It uses the iRAINS Backend —
 * Read-Only (Fetch) API Catalog to fetch data from various APIs") and cited
 * sections like "LLM output contract (required) > Field meanings". Users
 * should never see how the assistant is wired.
 */
const KNOWLEDGE_TYPES = ["concept", "glossary", "workflow"];

/** Technical document only — never the API catalogs. */
const KNOWLEDGE_SOURCES = ["techdoc"];

/** Appendix A is an internal DB reference; never answer a user from it. */
const USER_EXCLUDED_TYPES = ["schema", "sample"];

const MIN_SCORE = 0.008; // below this the fused ranking is noise

/**
 * Minimum cosine similarity for the documentation to count as an answer.
 *
 * Measured on this corpus: real product questions land at 0.61-0.77
 * ("what is irains" 0.77, "spatial distribution" 0.65, "data entry" 0.61)
 * while off-domain and meta questions land at 0.41-0.45 ("capital of France"
 * 0.45, "why is this chatbot" 0.42). Without this gate the assistant answered
 * off-domain questions out of whatever chunks ranked highest and cited them,
 * which looks authoritative and is not.
 */
const MIN_RELEVANCE = 0.55;

/**
 * Questions about the assistant itself. The technical document says nothing
 * about the chat, so answering these from retrieval produces a plausible reply
 * with irrelevant citations attached. Answer them plainly, with no sources.
 */
const META_PATTERNS = [
  /\bwho are (you|u)\b/i,
  /\bwhat are (you|u)\b/i,
  /\bwhat can (you|u) do\b/i,
  /\bwhat do (you|u) do\b/i,
  // no trailing \b here: "chat" is followed by "bot", which is a word
  // character, so a boundary would never match "why is this chatbot?"
  /\b(why|what) is this chat(bot)?/i,
  /\bwhy this chat(bot)?/i,
  /\bwhat is (this |the )?(assistant|varsha)\b/i,
  /\bare (you|u) (a )?(bot|ai|robot|human)\b/i,
  /\bhow do (you|u) work\b/i,
];

function isMetaQuestion(q) {
  return META_PATTERNS.some((re) => re.test(String(q || "")));
}

function buildMetaAnswer() {
  return (
    "I'm Varsha, the iRAINS assistant. I can give you live rainfall figures — actual, " +
    "normal and departure for a country, state, subdivision, district, block or station — " +
    "along with rankings, spatial distribution and monsoon activity. I can also explain how " +
    "the iRAINS modules work, and point you to the right product page if you ask where " +
    "something is."
  );
}

function buildKnowledgeSystemPrompt() {
  return `You are Varsha, the iRAINS assistant.

Answer the user's question using ONLY the reference sections provided below.
These come from the official iRAINS technical documentation.

Rules:
- Use only what the sections say. Never add outside meteorological knowledge.
- Be concise and direct: 2-5 sentences unless the question needs steps.
- When the question asks for a procedure or workflow, answer as short numbered steps.
- When a section gives thresholds or categories (e.g. departure ranges), quote the numbers exactly.
- Use IMD terminology exactly as written in the sections.
- If the sections do not answer the question, say so plainly and do not guess.
- Never invent rainfall values. This is a documentation answer, not a data answer.
- Do not mention "sections", "context" or "documents" in your reply — just answer.
- Answer about iRAINS as a product, from the user's side of the screen.
- NEVER mention internal implementation: APIs, endpoints, catalogs, backends, databases,
  models, or how the assistant itself is built. Users ask what iRAINS does, not how it is wired.
- Do not describe yourself or this chat assistant unless the user asked about the chat itself.`;
}

/**
 * @returns {Promise<object>} chat-service-shaped response
 */
async function answerKnowledgeQuestion(question, { topK = 6, includeInternal = false, skipAnswerLlm = false } = {}) {
  const result = await retrieve(question, {
    topK,
    types: includeInternal ? null : KNOWLEDGE_TYPES,
    sources: includeInternal ? null : KNOWLEDGE_SOURCES,
    excludeTypes: includeInternal ? ["sample"] : USER_EXCLUDED_TYPES,
  });

  const useful = result.chunks.filter((c) => c.score >= MIN_SCORE);
  const relevance = Math.max(0, ...result.chunks.map((c) => c.dense_score || 0));

  // Meta questions: answer plainly rather than citing unrelated sections.
  if (isMetaQuestion(question)) {
    return {
      success: true,
      mode: "rag_knowledge",
      answer: buildMetaAnswer(),
      answer_mode: "meta",
      sources: [],
      retrieval: { used: 0, relevance, timings: result.timings },
      action: { module: "knowledge", api_id: null, method: "META", path: null, reason: "question about the assistant" },
      navigation: null,
      api: { ok: true, status: 200, request: null, row_count: 0, data: [], note: "About the assistant." },
    };
  }

  if (!useful.length || relevance < MIN_RELEVANCE) {
    return {
      success: false,
      stage: "knowledge_no_match",
      mode: "rag_knowledge",
      out_of_scope: true,
      answer:
        "I could not find that in the iRAINS documentation. I can explain how the " +
        "system's modules work, what the rainfall terms mean, and where each product " +
        "lives — or give you rainfall figures. Try one of these:",
      suggestions: [
        ...(SAMPLE_QUESTIONS.rainfall || []).slice(0, 2),
        ...(SAMPLE_QUESTIONS.navigation || []).slice(0, 2),
      ],
      sample_questions: SAMPLE_QUESTIONS,
      sources: [],
      retrieval: {
        candidates: result.chunks.length,
        relevance,
        below_threshold: relevance < MIN_RELEVANCE,
        timings: result.timings,
      },
    };
  }

  const context = formatContext({ chunks: useful, pins: [] });

  let answer;
  let answerMode = "fallback";
  if (!skipAnswerLlm) {
    try {
      const llm = await askOllama(
        [
          { role: "system", content: buildKnowledgeSystemPrompt() },
          {
            role: "user",
            content: `REFERENCE SECTIONS:\n\n${context}\n\n---\n\nQUESTION: ${question}`,
          },
        ],
        { temperature: 0.1, formatJson: false }
      );
      answer = llm.content?.trim();
      answerMode = "ollama";
    } catch (err) {
      answer = null;
    }
  }

  if (!answer) {
    // Deterministic fallback: lead with the best-matching section verbatim.
    const top = useful[0];
    const body = top.text.split("\n\n").slice(1).join("\n\n").trim();
    answer = `From ${top.heading}:\n\n${body.slice(0, 900)}`;
    answerMode = "fallback";
  }

  const sources = useful.map((c) => ({
    heading_path: c.heading_path,
    heading: c.heading,
    source: c.file,
    type: c.type,
    score: c.score,
  }));

  return {
    success: true,
    mode: "rag_knowledge",
    answer,
    answer_mode: answerMode,
    sources,
    retrieval: {
      used: useful.length,
      candidates: result.chunks.length,
      relevance,
      context_tokens: Math.ceil(context.length / 4),
      timings: result.timings,
    },
    action: {
      module: "knowledge",
      api_id: null,
      method: "RAG",
      path: null,
      reason: "documentation question answered from the technical document",
    },
    navigation: null,
    api: { ok: true, status: 200, request: null, row_count: 0, data: [], note: "Documentation answer — no API call." },
  };
}

module.exports = {
  answerKnowledgeQuestion,
  buildKnowledgeSystemPrompt,
  KNOWLEDGE_TYPES,
  KNOWLEDGE_SOURCES,
  MIN_RELEVANCE,
};
