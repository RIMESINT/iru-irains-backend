const {
  handleOllamaChat,
  warmupCatalogIntoModel,
  getCatalogWarmupStatus,
  isOllamaUp,
  SAMPLE_QUESTIONS,
  PRODUCT_ROUTES,
} = require("./chatService");

/**
 * GET /api/v1/ollama-chat/health
 */
exports.health = async (_req, res) => {
  const status = await isOllamaUp();
  return res.status(status.up ? 200 : 503).json({
    success: status.up,
    ollama: status,
    catalog: getCatalogWarmupStatus(),
    demo_question: SAMPLE_QUESTIONS.rainfall[0],
    sample_questions: SAMPLE_QUESTIONS,
    navigation_products: PRODUCT_ROUTES.map(({ product_name, route_path }) => ({
      product_name,
      route_path,
    })),
    training_note:
      "Questions are taught via docs/IRAINS_API_CATALOG.md few-shot examples (no model fine-tuning). Add more Q→API / Q→route examples there. Call POST /api/v1/ollama-chat/warmup when the chat UI opens so the catalog is read before the first question.",
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
