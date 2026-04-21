const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, dob, gender } = req.body;

        if (!req.file) {
            res.status(400);
            throw new Error('Profile photo is mandatory');
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            res.status(400);
            throw new Error('User already exists');
        }

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'punar_milan/profiles',
            width: 500,
            crop: "scale"
        });

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const user = await User.create({
            name,
            email,
            password,
            phone,
            dob,
            gender,
            profilePhoto: result.secure_url
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                dob: user.dob,
                gender: user.gender,
                profilePhoto: user.profilePhoto,
                profileCompletion: user.profileCompletion
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
    res.json({ message: 'User logged out' });
};

module.exports = {
    register,
    login,
    getMe,
    logout,
};
