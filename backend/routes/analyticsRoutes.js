const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');

// @route   GET /api/analytics/profit-loss
// @desc    Calculate overall and category-wise revenue, cost, and profit
// @access  Public
router.get('/profit-loss', async (req, res) => {
    try {
        // Fetch all sales and neatly populate the related product object containing pricing
        const sales = await Sale.find().populate('product');

        // Handle empty data case as instructed
        if (!sales || sales.length === 0) {
            return res.status(200).json({
                overall: { revenue: 0, cost: 0, profit: 0 },
                categories: []
            });
        }

        let totalRevenue = 0;
        let totalCost = 0;
        let totalProfit = 0;
        const categoryMap = {};

        // Calculate stats using actual sales data and product pricing
        sales.forEach(sale => {
            if (sale.product) {
                const quantity = sale.quantity || 0;
                
                // Use specified fields
                const costPrice = sale.product.costPrice || 0;
                const sellingPrice = sale.product.sellingPrice || 0;
                const category = sale.product.category || 'Uncategorized';

                // Basic Logic: 
                // revenue = sellingPrice × quantity
                // cost = costPrice × quantity
                // profit = revenue − cost
                const revenue = sellingPrice * quantity;
                const cost = costPrice * quantity;
                const profit = revenue - cost;

                // Overall totals
                totalRevenue += revenue;
                totalCost += cost;
                totalProfit += profit;

                // Category-wise logic
                if (!categoryMap[category]) {
                    categoryMap[category] = { category, revenue: 0, cost: 0, profit: 0 };
                }
                categoryMap[category].revenue += revenue;
                categoryMap[category].cost += cost;
                categoryMap[category].profit += profit;
            }
        });

        // Convert category grouping map back to required array format
        const categories = Object.values(categoryMap);

        res.status(200).json({
            overall: {
                revenue: totalRevenue,
                cost: totalCost,
                profit: totalProfit
            },
            categories
        });
    } catch (error) {
        console.error("Profit Loss Error:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;
