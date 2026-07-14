const express = require("express");
const router  = express.Router();
const { getMode, setMode, recordOfficerAccess } = require("../controllers/CalculationsModeController");

router.get("/calculations-mode",  getMode);
router.post("/calculations-mode/officer-access", recordOfficerAccess);
router.post("/calculations-mode", setMode);

module.exports = router;
