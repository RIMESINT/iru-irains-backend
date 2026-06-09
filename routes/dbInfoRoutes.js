const express = require('express');
const router  = express.Router();
const { getDbInfo } = require('../controllers/scripts/dbInfo');

router.get('/getDbInfo', getDbInfo);

module.exports = router;
