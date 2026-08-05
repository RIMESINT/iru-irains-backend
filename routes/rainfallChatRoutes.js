const express = require("express");
const router = express.Router();
const { health, chat } = require("../controllers/ollamaChat/ollamaChatController");

// Compatibility alias:
// Old frontend path: POST /api/v1/rainfall-chat
// Now forwarded to: POST /api/v1/ollama-chat
router.get("/rainfall-chat/health", health);
router.post("/rainfall-chat", chat);

module.exports = router;

