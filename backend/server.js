import 'express-async-errors';
import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/database.js';

// Load env vars
dotenv.config();

// Database connection
await connectDB();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Baloch Ice Cream Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log('❌ Unhandled Rejection:', err.message);
    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

export default server;