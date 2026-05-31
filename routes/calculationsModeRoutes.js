const express = require("express");
const router  = express.Router();
const { getMode, setMode } = require("../controllers/CalculationsModeController");

router.get("/calculations-mode",  getMode);
router.post("/calculations-mode", setMode);

module.exports = router;
