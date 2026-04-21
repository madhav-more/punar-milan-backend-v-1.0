const User = require('../models/User');

// @desc    Get newly joined profiles
// @route   GET /api/discovery/new
// @access  Private
const getNewProfiles = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ _id: { $ne: req.user._id } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password');
            
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get daily curated profiles
// @route   GET /api/discovery/daily
// @access  Private
const getDailyProfiles = async (req, res, next) => {
    try {
        // Simple daily curation: grab a random sample of 10 users
        const users = await User.aggregate([
            { $match: { _id: { $ne: req.user._id } } },
            { $sample: { size: 10 } },
            { $project: { password: 0 } } // exclude password
        ]);
        
        res.json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Get matched profiles based on similarity
// @route   GET /api/discovery/matches
// @access  Private
const getMatchedProfiles = async (req, res, next) => {
    try {
        const currentUser = await User.findById(req.user._id);
        
        const allUsers = await User.find({ _id: { $ne: req.user._id } }).select('-password').lean();
        
        // Match Engine
        const matchedUsers = allUsers.map(user => {
            let score = 0;
            
            // Religion & Caste (High weight)
            if (currentUser.religion && user.religion === currentUser.religion) score += 30;
            if (currentUser.caste && user.caste === currentUser.caste) score += 20;
            
            // Location (Medium weight)
            if (currentUser.state && user.state === currentUser.state) score += 15;
            if (currentUser.city && user.city === currentUser.city) score += 10;
            
            // Diet (Medium weight)
            if (currentUser.diet && user.diet === currentUser.diet) score += 10;
            
            // Education & Mother Tongue (Low weight)
            if (currentUser.education && user.education === currentUser.education) score += 5;
            if (currentUser.motherTongue && user.motherTongue === currentUser.motherTongue) score += 10;
            
            return {
                ...user,
                matchScore: score
            };
        });
        
        // Sort by match score descending
        matchedUsers.sort((a, b) => b.matchScore - a.matchScore);
        
        res.json(matchedUsers.slice(0, 20));
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNewProfiles,
    getDailyProfiles,
    getMatchedProfiles
};
