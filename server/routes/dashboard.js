const express = require('express');
const router = express.Router();
const { getStats, getCharts } = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.get('/stats', auth, getStats);
router.get('/charts', auth, getCharts);

module.exports = router;
