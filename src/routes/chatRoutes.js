const express = require('express');
const router = express.Router();
const { getChats, getMessages, createChat } = require('../controllers/chatController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getChats)
    .post(protect, createChat);

router.route('/:id/messages')
    .get(protect, getMessages);

module.exports = router;
