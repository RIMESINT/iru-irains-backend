const express = require("express");
const router = express.Router();
const { health, chat } = require("../controllers/ollamaChat/ollamaChatController");

router.get("/ollama-chat/health", health);
router.post("/ollama-chat", chat);

module.exports = router;
