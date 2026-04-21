const socketio = require('socket.io');

let io;
const connectedUsers = new Map();

const initSocket = (server) => {
    io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        let currentUserId = null;
        console.log('New client connected:', socket.id);

        socket.on('join', (userId) => {
            currentUserId = userId;
            socket.join(userId);
            connectedUsers.set(userId, socket.id);
            console.log(`User ${userId} joined their room`);
            io.emit('userOnline', userId);
        });

        // Request online status of a user
        socket.on('checkOnlineStatus', (userId) => {
            if (connectedUsers.has(userId)) {
                socket.emit('userOnline', userId);
            } else {
                socket.emit('userOffline', userId);
            }
        });

        socket.on('sendMessage', async ({ chatId, senderId, receiverId, content, tempId }) => {
            try {
                const Message = require('../models/Message');
                const Chat = require('../models/Chat');

                const message = await Message.create({
                    chatId,
                    sender: senderId,
                    content,
                    isRead: false
                });

                await Chat.findByIdAndUpdate(chatId, {
                    lastMessage: message._id
                });

                const messageObj = message.toObject ? message.toObject() : message;
                if (tempId) messageObj.tempId = tempId;

                // Emit to receiver
                io.to(receiverId).emit('messageReceived', messageObj);
                // Also emit back to sender (to sync instances if needed, or just for confirmation)
                io.to(senderId).emit('messageSent', messageObj);
            } catch (error) {
                console.error('Socket sendMessage error:', error);
            }
        });

        socket.on('mark_read', async ({ messageId, senderId, receiverId }) => {
            try {
                const Message = require('../models/Message');
                await Message.findByIdAndUpdate(messageId, { isRead: true });
                // Notify the sender that their message was read
                io.to(senderId).emit('messageRead', { messageId, receiverId });
            } catch (error) {
                console.error('Socket mark_read error:', error);
            }
        });

        socket.on('typing', ({ receiverId, senderId }) => {
            io.to(receiverId).emit('typing', { senderId });
        });

        socket.on('stop_typing', ({ receiverId, senderId }) => {
            io.to(receiverId).emit('stop_typing', { senderId });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
            if (currentUserId) {
                connectedUsers.delete(currentUserId);
                io.emit('userOffline', currentUserId);
            }
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

module.exports = { initSocket, getIO, connectedUsers };
