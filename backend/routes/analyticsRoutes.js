const express = require('express');
const router = express.Router();
const { getAnalyticsOverview } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/overview').get(protect, getAnalyticsOverview);

module.exports = router;