require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/'))); // Serve static files from root

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Routes
app.use('/api', authRoutes);

// Serve frontend for any other route (SPA-like behavior if needed, or just static)
app.get('*', (req, res) => {
    // If accessing API routes that don't exist
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API Route not found' });
    }
    // Default to login.html or index
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
