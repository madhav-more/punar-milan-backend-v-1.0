const express = require('express');
const router = express.Router();
const { getNewProfiles, getDailyProfiles, getMatchedProfiles } = require('../controllers/discoveryController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/new', protect, getNewProfiles);
router.get('/daily', protect, getDailyProfiles);
router.get('/matches', protect, getMatchedProfiles);

module.exports = router;
