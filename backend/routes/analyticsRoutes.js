const express = require('express');
const router = express.Router();
const { getDailyAnalytics, getWeeklyAnalytics, getMonthlyAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/daily', protect, getDailyAnalytics);
router.get('/weekly', protect, getWeeklyAnalytics);
router.get('/monthly', protect, getMonthlyAnalytics);

module.exports = router;
