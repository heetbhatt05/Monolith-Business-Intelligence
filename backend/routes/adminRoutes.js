const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Insight = require('../models/Insight'); // Import Insight model

// @route   DELETE /api/admin/reset-system
// @desc    Delete ALL Products, Sales, and Insights (Dangerous!)
// @access  Public (Admin)
router.delete('/reset-system', async (req, res) => {
    try {
        // 1. Delete All Sales
        await Sale.deleteMany({});

        // 2. Delete All Products
        await Product.deleteMany({});

        // 3. Delete All AI Insights
        await Insight.deleteMany({});

        res.status(200).json({
            message: "⚠️ System Reset Successful. All Inventory, Sales, and AI Insights have been wiped.",
            success: true
        });

    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ message: "Server Error during reset", error: error.message });
    }
});

module.exports = router;
