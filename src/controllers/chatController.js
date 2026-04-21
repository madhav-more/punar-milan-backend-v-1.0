const Chat = require('../models/Chat');
const Message = require('../models/Message');

// @desc    Get all user chats
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({ participants: { $in: [req.user._id] } })
            .populate('participants', 'name profilePhoto')
            .populate('lastMessage')
            .sort('-updatedAt');
        res.json(chats);
    } catch (error) {
        next(error);
    }
};

// @desc    Get chat messages
// @route   GET /api/chats/:id/messages
// @access  Private
const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find({ chatId: req.params.id })
            .sort('createdAt');
        res.json(messages);
    } catch (error) {
        next(error);
    }
};

// @desc    Create or get existing chat
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res, next) => {
    try {
        const { userId } = req.body;

        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, userId] }
        });

        if (!chat) {
            chat = await Chat.create({
                participants: [req.user._id, userId]
            });
        }

        res.json(chat);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getChats,
    getMessages,
    createChat
};
