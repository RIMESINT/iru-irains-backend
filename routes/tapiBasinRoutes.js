const express = require("express");
const router = express.Router();

const { fetchTapiBasinRainfallDataAPIexport } = require("../controllers/TapiBasin");

// ********************************************************************************************************
//                                      Tapi Basin routes
// ********************************************************************************************************

router.post("/fetchTapiBasinRainfallDataAPIexport", fetchTapiBasinRainfallDataAPIexport);

module.exports = router;
