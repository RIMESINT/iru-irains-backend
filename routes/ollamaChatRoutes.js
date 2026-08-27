const express = require("express");
const router = express.Router();
const {
  health,
  warmup,
  chat,
} = require("../controllers/ollamaChat/ollamaChatController");

router.get("/ollama-chat/health", health);
router.get("/ollama-chat/warmup", warmup);
router.post("/ollama-chat/warmup", warmup);
router.post("/ollama-chat", chat);

module.exports = router;
