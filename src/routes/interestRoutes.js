const express = require('express');
const router = express.Router();
const { 
    sendInterest, 
    updateInterestStatus, 
    getReceivedInterests, 
    getSentInterests 
} = require('../controllers/interestController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .post(protect, sendInterest);

router.route('/received')
    .get(protect, getReceivedInterests);

router.route('/sent')
    .get(protect, getSentInterests);

router.route('/:id')
    .put(protect, updateInterestStatus);

module.exports = router;
