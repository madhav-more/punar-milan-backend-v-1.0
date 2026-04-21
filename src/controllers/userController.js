const User = require('../models/User');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            // Update fields if provided in request body
            const updatableFields = [
                'name', 'phone', 'religion', 'caste', 'motherTongue', 
                'city', 'state', 'country', 'education', 'occupation', 
                'income', 'bio', 'height', 'diet', 'smoking', 'drinking'
            ];

            updatableFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    user[field] = req.body[field];
                }
            });

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            // Return full user object (excluding password)
            const userObj = updatedUser.toObject();
            delete userObj.password;

            res.json(userObj);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all profiles (Discovery)
// @route   GET /api/users
// @access  Private
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Upload profile photo
// @route   POST /api/users/profile/photo
// @access  Private
const uploadProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image');
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'punar_milan/profiles',
            width: 500,
            crop: "scale"
        });

        const user = await User.findById(req.user._id);
        user.profilePhoto = result.secure_url;
        await user.save();

        // Clean up local file
        fs.unlinkSync(req.file.path);

        res.json({
            profilePhoto: user.profilePhoto,
            profileCompletion: user.profileCompletion
        });
    } catch (error) {
        // Clean up local file on error if it exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Toggle shortlist a user
// @route   POST /api/users/shortlist
// @access  Private
const toggleShortlist = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user.shortlisted) {
            user.shortlisted = [];
        }

        const index = user.shortlisted.indexOf(targetUserId);
        if (index > -1) {
            user.shortlisted.splice(index, 1);
            await user.save();
            res.json({ message: 'User removed from shortlist', shortlisted: user.shortlisted });
        } else {
            user.shortlisted.push(targetUserId);
            await user.save();
            res.json({ message: 'User added to shortlist', shortlisted: user.shortlisted });
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProfile,
    getUsers,
    getUserById,
    uploadProfilePhoto,
    toggleShortlist
};
