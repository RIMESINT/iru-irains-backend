const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/StationDashboardController');

router.get('/station-dashboard/metrics',        ctrl.getMetrics);
router.get('/station-dashboard/distribution',   ctrl.getDistribution);
router.get('/station-dashboard/recent-changes', ctrl.getRecentChanges);
router.get('/station-dashboard/history',        ctrl.getHistory);
router.get('/station-dashboard/timeline',       ctrl.getTimeline);
router.get('/station-dashboard/geography',       ctrl.getGeography);
router.get('/station-dashboard/blocks',         ctrl.getBlocks);
router.get('/station-dashboard/rmc-mc-options', ctrl.getRmcMcOptions);
router.get('/station-dashboard/station',        ctrl.getStationByCode);
router.get('/station-dashboard/stations',       ctrl.listActiveStations);

router.post('/station-dashboard/generate-code', ctrl.generateCode);
router.post('/station-dashboard/move-station',  ctrl.moveStation);

router.delete('/station-dashboard/permanent-delete', ctrl.permanentDelete);
router.post('/station-dashboard/search',        ctrl.searchStations);

module.exports = router;
