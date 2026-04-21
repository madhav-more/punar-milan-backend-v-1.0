const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateProfile, uploadProfilePhoto } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(protect, getUsers);

router.route('/profile')
    .put(protect, updateProfile);

router.post('/profile/photo', protect, upload.single('photo'), uploadProfilePhoto);
router.post('/shortlist', protect, require('../controllers/userController').toggleShortlist);

router.route('/:id')
    .get(protect, getUserById);

module.exports = router;
