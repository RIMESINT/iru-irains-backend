const express = require("express");
const router = express.Router();

const { getAllowedRoutes } = require("../controllers/scripts/admin-panel/routingAccess");

router.post("/get-allowed-routes", getAllowedRoutes);

module.exports = router;