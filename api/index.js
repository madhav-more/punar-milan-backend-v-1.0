const app = require('../src/app');
const connectDB = require('../src/config/db');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to Database
// Note: In serverless, database connections are often outside the handler for reuse
let isConnected = false;

const startServer = async () => {
    if (!isConnected) {
        await connectDB();
        isConnected = true;
    }
};

// Export the bridge for Vercel
module.exports = async (req, res) => {
    await startServer();
    return app(req, res);
};
