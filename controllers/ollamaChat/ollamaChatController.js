const {
  handleOllamaChat,
  warmupCatalogIntoModel,
  getCatalogWarmupStatus,
  isOllamaUp,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
} = require("./chatService");
const { getIndexMeta } = require("./rag/indexStore");
const { OLLAMA_NUM_CTX, OLLAMA_EMBED_MODEL } = require("./ollamaClient");
const { getCatalogMeta } = require("./catalogLoader");

/**
 * GET /api/v1/ollama-chat/health
 */
exports.health = async (_req, res) => {
  const status = await isOllamaUp();
  const rag = getIndexMeta();

  // A full-catalog prompt is ~11k tokens. Ollama's own default num_ctx is 2048
  // and it truncates SILENTLY, so surface the comparison rather than letting a
  // misconfigured window fail as mysterious wrong answers.
  const catalogTokens = Math.ceil(getCatalogMeta().chars / 4) + 700;
  const contextBudget = {
    num_ctx: OLLAMA_NUM_CTX,
    full_catalog_prompt_tokens: catalogTokens,
    full_catalog_fits: catalogTokens <= OLLAMA_NUM_CTX,
    retrieval_prompt_tokens_typical: 3000,
    warning:
      catalogTokens > OLLAMA_NUM_CTX && !rag.ready
        ? "num_ctx is smaller than a full-catalog prompt AND the RAG index is unavailable. " +
          "Ollama will truncate the catalog and the planner will invent api_id values. " +
          "Run: npm run rag:build (or raise OLLAMA_NUM_CTX)."
        : null,
  };

  const ok = status.up && (rag.ready || contextBudget.full_catalog_fits);

  return res.status(ok ? 200 : 503).json({
    success: ok,
    ollama: status,
    context_budget: contextBudget,
    rag: {
      ...rag,
      embed_model: rag.embed_model || OLLAMA_EMBED_MODEL,
      rebuild_hint: rag.ready
        ? rag.stale
          ? "Index is STALE — a source document changed. Run: npm run rag:build"
          : null
        : "Run: npm run rag:build",
    },
    catalog: getCatalogWarmupStatus(),
    demo_question: SAMPLE_QUESTIONS.rainfall[0],
    sample_questions: SAMPLE_QUESTIONS,
    navigation_products: PRODUCT_ROUTES.map(({ product_name, route_path }) => ({
      product_name,
      route_path,
    })),
    training_note:
      "Questions are answered by retrieval, not fine-tuning. Rainfall/navigation questions retrieve from docs/IRAINS_API_CATALOG.md; how-it-works and terminology questions retrieve from docs/IRAINS_TECHNICAL_DOCUMENT.md. Edit those files, then run `npm run rag:build` to re-index. Call POST /api/v1/ollama-chat/warmup when the chat UI opens to load the index and warm the model.",
    install_hint: [
      "1) Install Ollama from https://ollama.com",
      "2) Run: ollama serve",
      "3) Run: ollama pull llama3.2",
      "4) Retry this health endpoint",
    ],
  });
};

/**
 * POST /api/v1/ollama-chat/warmup
 * Load the API catalog into Ollama before the user asks a question.
 * Frontend should call this when the chatbot widget opens.
 */
exports.warmup = async (req, res) => {
  try {
    const forceRaw = req.body?.force ?? req.query?.force;
    const force =
      forceRaw === true ||
      forceRaw === 1 ||
      String(forceRaw || "").trim().toLowerCase() === "true" ||
      String(forceRaw || "").trim() === "1";
    const catalog = await warmupCatalogIntoModel({ force });
    return res.status(catalog.ready ? 200 : 503).json({
      success: catalog.ready,
      catalog,
    });
  } catch (error) {
    console.error("ollama-chat warmup error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Catalog warmup failed",
      catalog: getCatalogWarmupStatus(),
    });
  }
};

/**
 * POST /api/v1/ollama-chat
 * Body: { "question": "What is today's rainfall for Maharashtra?" }
 *
 * Flow:
 * Ollama reads docs/IRAINS_API_CATALOG.md → chooses rainfall API or navigation route → answer
 */
exports.chat = async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
        example: {
          question: SAMPLE_QUESTIONS.rainfall[0],
        },
        sample_questions: SAMPLE_QUESTIONS,
      });
    }

    const skipAnswerLlm = Boolean(req.body?.skipAnswerLlm);
    const previousQuestion = String(
      req.body?.previous_question || req.body?.previousQuestion || ""
    ).trim();
    const result = await handleOllamaChat(question, {
      skipAnswerLlm,
      previousQuestion: previousQuestion || null,
    });
    return res.status(result.success ? 200 : 422).json(result);
  } catch (error) {
    console.error("ollama-chat error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Ollama chat failed",
      meta: error.meta || null,
    });
  }
};
