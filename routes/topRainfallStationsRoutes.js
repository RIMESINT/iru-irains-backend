const express = require("express");
const router = express.Router();
const { getTopRainfallStations } = require("../controllers/TopRainfallStationsController");

router.get("/top-rainfall-stations", getTopRainfallStations);

module.exports = router;
