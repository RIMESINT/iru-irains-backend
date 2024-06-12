const express = require("express")
const router = express.Router()
const { insertStationData} = require("../controllers/scripts/station/stationDailyData")


router.get("/insertStationData", insertStationData);

module.exports = router;