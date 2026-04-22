const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   POST /api/predict/sales
// @desc    Send data to Python ML model
// @access  Public
router.post('/sales', async (req, res) => {
    try {
        console.log("📤 Sending data to Python:", req.body);

        // FIX: Send req.body DIRECTLY. Do not wrap it in { features: ... }
        const pythonResponse = await axios.post('http://127.0.0.1:5001/predict_sales', req.body);

        // Send answer back to User
        res.status(200).json({
            message: "Prediction Successful",
            result: pythonResponse.data
        });

    } catch (error) {
        console.error("ML Error:", error.message);
        res.status(500).json({ 
            message: "Failed to communicate with AI Model", 
            error: error.message 
        });
    }
});

module.exports = router;