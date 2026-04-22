const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const axios = require('axios');
const timeStore = require('../utils/timeStore'); // For Time Travel Testing

// @route   GET /api/sales/insights/history
// @desc    Get Full History of AI Insights (MOVED TO TOP TO FIX 404)
// @access  Public
router.get('/insights/history', async (req, res) => {
    try {
        const Insight = require('../models/Insight');
        const { product, month, type } = req.query;

        const query = {};

        // Optional Filters
        if (product) query.productName = { $regex: product, $options: 'i' }; // Partial match
        if (month) query.month = Number(month);
        if (type) query.insightType = type;

        // Fetch all matching insights, sorted by newest first
        const history = await Insight.find(query).sort({ generatedAt: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch insight history", error: error.message });
    }
});

// @route   POST /api/sales/add
// @desc    Record a new sale AND update inventory
// @access  Public
router.post('/add', async (req, res) => {
    try {
        const { productId, quantity, finalPrice } = req.body;

        // 1. Find the Product in DB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 2. CHECK STOCK
        if (product.stockQuantity < quantity) {
            return res.status(400).json({ message: "Insufficient Stock!" });
        }

        // 3. LOGIC: Calculate Discount & Total
        // Original Price logic
        const originalPrice = product.sellingPrice;

        // Ensure Final Price is valid (cannot be negative)
        const validFinalPrice = finalPrice >= 0 ? Number(finalPrice) : originalPrice;

        const discountAmount = originalPrice - validFinalPrice;
        const totalAmount = validFinalPrice * quantity;

        // 4. Create Sale Record
        const newSale = new Sale({
            product: productId,
            quantity: quantity,
            originalPrice: originalPrice,
            finalPrice: validFinalPrice,
            discountAmount: discountAmount,
            totalAmount: totalAmount,
            saleDate: timeStore.getCurrentDate() // USE SIMULATED DATE
        });

        // 5. UPDATE INVENTORY (The Critical Step)
        product.stockQuantity = product.stockQuantity - quantity;

        // 6. SAVE BOTH (Sequential)
        await product.save(); // Updates the stock
        await newSale.save(); // Saves the sale history

        res.status(201).json({
            message: "Sale Recorded Successfully",
            sale: newSale,
            remainingStock: product.stockQuantity
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   GET /api/sales/all
// @desc    Get complete sales history (Populated with Product Name)
// @access  Public
router.get('/all', async (req, res) => {
    try {
        // .populate('product') replaces the ugly ID with actual Product Details
        const sales = await Sale.find().populate('product', 'name category sellingPrice');
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   GET /api/sales/analytics/daily
// @desc    Get total sales grouped by Date (for Charts)
// @access  Public
router.get('/analytics/daily', async (req, res) => {
    try {
        const salesData = await Sale.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                    totalSales: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } } // Sort by date (Oldest to Newest)
        ]);

        res.status(200).json(salesData);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   POST /api/sales/predict-demand
// @desc    Generic demand simulation using pretrained retail ML model
// @access  Public
// NOTE: This is a WHAT-IF SIMULATION using a generic retail model.
//       Categorical fields are placeholders. Output is NOT product-specific.
//       Real business decisions use sales analytics and rule-based insights.
router.post('/predict-demand', async (req, res) => {
    try {
        const { productId, discount } = req.body;

        // 1. Fetch Product
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: "Product not found" });

        // 2. Fetch Sales History for THIS Product
        const salesHistory = await Sale.find({ product: productId });

        // 3. Calculate AVERAGE transaction quantity (not total)
        // CRITICAL FIX: Model was trained on per-transaction data (1-10 units typically)
        // Sending lifetime totals (50-200+) produces inflated, invalid predictions.
        let avgQuantity = 1; // Default for products with no sales history
        let totalSalesCount = salesHistory.length;

        if (totalSalesCount > 0) {
            const totalQuantity = salesHistory.reduce((sum, sale) => sum + sale.quantity, 0);
            avgQuantity = totalQuantity / totalSalesCount; // Average units per transaction
        }

        // 4. Construct Payload for Python API
        // IMPORTANT: Categorical fields are STATIC PLACEHOLDERS for a generic retail model.
        // They do NOT represent actual product categories in this system.
        // This is a limitation of using a pretrained model without category mapping.
        const aiPayload = {
            "Category": "Furniture",           // Static placeholder (model trained on retail data)
            "Sub-Category": "Chairs",          // Static placeholder
            "Region": "West",                  // Static placeholder
            "Segment": "Consumer",             // Static placeholder
            "Ship Mode": "Standard Class",     // Static placeholder
            "Quantity": avgQuantity,           // REAL: average transaction size
            "Discount": Number(discount) || 0.0 // REAL: user input for simulation
        };

        // 5. Call Python API
        try {
            const pythonResponse = await axios.post('http://127.0.0.1:5001/predict_sales', aiPayload);

            res.status(200).json({
                message: "Simulation Complete",
                simulatedDemandEstimate: pythonResponse.data.predicted_sales, // Changed label
                basedOnHistory: {
                    averageTransactionSize: parseFloat(avgQuantity.toFixed(2)),
                    totalTransactions: totalSalesCount
                },
                disclaimer: "Generic simulation using pretrained retail model. Not product-specific."
            });
        } catch (mlError) {
            console.error("ML Connection Error:", mlError.message);
            res.status(503).json({ message: "AI Service Unavailable", error: mlError.message });
        }

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   DELETE /api/sales/undo-last
// @desc    Undo the most recent sale (Testing Utility)
// @access  Public
router.delete('/undo-last', async (req, res) => {
    try {
        // 1. Find the LAST sale (sort by date desc)
        const lastSale = await Sale.findOne().sort({ saleDate: -1 });

        if (!lastSale) {
            return res.status(404).json({ message: "No sales found to undo." });
        }

        // 2. Find the associated Product
        const product = await Product.findById(lastSale.product);

        if (product) {
            // 3. Restore Stock
            product.stockQuantity = product.stockQuantity + lastSale.quantity;
            await product.save();
        }

        // 4. Delete the Sale Record
        await Sale.findByIdAndDelete(lastSale._id);

        res.status(200).json({
            message: "Last Sale Undone Successfully",
            restoredProduct: product ? product.name : "Unknown",
            restoredQty: lastSale.quantity
        });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   GET /api/sales/insights
// @desc    Get Automated Business Insights (Stored & Filtered)
// @access  Public
router.get('/insights', async (req, res) => {
    try {
        const { generateInsights } = require('../utils/insightEngine');
        const Insight = require('../models/Insight'); // Fetch from DB

        // 1. Trigger Generation (Refresh DB)
        // We run this to ensure "Current" insights (like stock risk) are up to date.
        // Ops are idempotent (upsert), so it's safe.
        await generateInsights();

        // 2. Parse Query Params
        const { month, status } = req.query;
        const query = {};

        // Status Filter (Default: active)
        query.status = status || 'active';

        // Month Filter
        if (month) {
            let targetMonth;
            if (month === 'current') {
                targetMonth = new Date().getMonth() + 1;
            } else {
                targetMonth = Number(month);
            }

            // Logic: Show insights specific to Target Month OR General/Global insights (no month)
            query.$or = [
                { month: targetMonth },
                { month: null },
                { month: { $exists: false } }
            ];
        }

        // 3. Fetch from DB
        const insights = await Insight.find(query).sort({ generatedAt: -1 });

        res.json(insights);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch insights", error: error.message });
    }
});

// @route   GET /api/sales/analytics/seasonal-summary
// @desc    Get detected high-demand periods per product
// @access  Public
router.get('/analytics/seasonal-summary', async (req, res) => {
    try {
        const { generateInsights } = require('../utils/insightEngine');
        const result = await generateInsights();
        res.json(result.seasonalSummary);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch seasonal summary", error: error.message });
    }
});

module.exports = router;