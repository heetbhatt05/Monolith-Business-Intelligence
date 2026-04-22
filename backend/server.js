require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const predictionRoutes = require('./routes/predictionRoutes');

// 1. IMPORT ROUTES (This is fine at the top)
// 1. IMPORT ROUTES (This is fine at the top)
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const adminRoutes = require('./routes/adminRoutes'); // New Admin Route
const forecastRoutes = require('./routes/forecastRoutes'); // Seasonal Forecast Route
const analyticsRoutes = require('./routes/analyticsRoutes'); // Profit Loss Analytics Route
const demoRoutes = require('./routes/demoRoutes'); // Hidden Demo Data Routes

// 2. INITIALIZE APP (You must do this BEFORE using 'app')
const app = express();

// 3. MIDDLEWARE (The Gatekeepers)
app.use(express.json());
app.use(cors());

// 4. USE ROUTES (Now 'app' exists, so this works)
// This tells the server: "If URL starts with /api/products, go to productRoutes"
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/predict', predictionRoutes);
app.use('/api/forecast', forecastRoutes); // Mount Seasonal Forecast Routes
app.use('/api/analytics', analyticsRoutes); // Mount Analytics Routes
app.use('/api/admin', adminRoutes); // Mount Admin Route
app.use('/api/test', require('./routes/testRoutes')); // Testing Utility Routes
app.use('/api/demo', demoRoutes); // Hidden endpoint

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- BASIC ROUTE ---
app.get('/', (req, res) => {
    res.send('BCA Project Backend is Running...');
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});