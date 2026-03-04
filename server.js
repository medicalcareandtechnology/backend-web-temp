const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON requests
app.use(express.urlencoded({ extended: true }));

// Database Connection
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('Connected to MongoDB Atlas'))
        .catch((err) => console.error('MongoDB connection error:', err));
} else {
    console.warn('⚠️ MONGO_URI is not defined in .env! Skipping MongoDB connection.');
}

// Route Imports
const healthRoutes = require('./routes/health');
const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);

// General 404 handler for API
app.use((req, res) => {
    if (req.path.startsWith('/api')) {
        res.status(404).json({ message: 'API route not found' });
    } else {
        res.status(404).send('Not Found');
    }
});

// Start Server
app.listen(PORT, (err) => {
    if (err) {
        console.error('Failed to start server:', err);
    } else {
        console.log(`Server is running on port ${PORT}`);
    }
});
