const Interest = require('../models/Interest');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Send interest
// @route   POST /api/interests
// @access  Private
const sendInterest = async (req, res, next) => {
    try {
        const { receiverId } = req.body;

        if (req.user._id.toString() === receiverId) {
            res.status(400);
            throw new Error('You cannot send interest to yourself');
        }

        const existingInterest = await Interest.findOne({
            sender: req.user._id,
            receiver: receiverId
        });

        if (existingInterest) {
            res.status(400);
            throw new Error('Interest already sent');
        }

        const interest = await Interest.create({
            sender: req.user._id,
            receiver: receiverId,
            status: 'pending'
        });

        res.status(201).json(interest);
    } catch (error) {
        next(error);
    }
};

// @desc    Update interest status (Accept/Reject)
// @route   PUT /api/interests/:id
// @access  Private
const updateInterestStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const interest = await Interest.findById(req.params.id);

        if (interest) {
            if (interest.receiver.toString() !== req.user._id.toString()) {
                res.status(401);
                throw new Error('Not authorized to update this interest');
            }

            interest.status = status;
            const updatedInterest = await interest.save();

            // Automate Chat creation when status is accepted
            if (status === 'accepted') {
                const existingChat = await Chat.findOne({
                    participants: { $all: [interest.sender, interest.receiver] }
                });

                if (!existingChat) {
                    await Chat.create({
                        participants: [interest.sender, interest.receiver]
                    });
                }
            }

            res.json(updatedInterest);
        } else {
            res.status(404);
            throw new Error('Interest not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get received interests
// @route   GET /api/interests/received
// @access  Private
const getReceivedInterests = async (req, res, next) => {
    try {
        const interests = await Interest.find({ receiver: req.user._id })
            .populate('sender', 'name profilePhoto city dob religion caste')
            .sort('-createdAt');
        res.json(interests);
    } catch (error) {
        next(error);
    }
};

// @desc    Get sent interests
// @route   GET /api/interests/sent
// @access  Private
const getSentInterests = async (req, res, next) => {
    try {
        const interests = await Interest.find({ sender: req.user._id })
            .populate('receiver', 'name profilePhoto city dob religion caste')
            .sort('-createdAt');
        res.json(interests);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendInterest,
    updateInterestStatus,
    getReceivedInterests,
    getSentInterests
};
