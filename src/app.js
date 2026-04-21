const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api', limiter);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Punar Milan API' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/interests', require('./routes/interestRoutes'));
app.use('/api/chats', require('./routes/chatRoutes'));
app.use('/api/discovery', require('./routes/discoveryRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
