const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const Sale = require('../models/Sale');

// @route   GET /api/forecast/seasonal/:productId
// @desc    Fetch sales for productId, group by month, get ML predictions
// @access  Public
router.get('/seasonal/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        
        // 1. Data Quality Handling & 5. Sort Data Before Training
        // Fetch valid sales, group by year and month to preserve strictly temporal order
        const salesData = await Sale.aggregate([
            {
                $match: {
                    product: new mongoose.Types.ObjectId(productId),
                    quantity: { $gte: 0 },
                    saleDate: { $type: "date" }
                }
            },
            {
                $group: {
                    _id: { year: { $year: "$saleDate" }, month: { $month: "$saleDate" } },
                    totalQuantity: { $sum: "$quantity" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 } // Proper chronological sort
            }
        ]);
        
        if (!salesData || salesData.length === 0) {
            console.log(`[FORECAST LOG] Product: ${productId} | Points: 0 | Status: Failed (No Data)`);
            return res.status(200).json({ message: "No sufficient sales data available for forecasting", predictions: [] });
        }
        
        // Format to map to "month" and strictly valid quantity
        const pythonSalesPayload = salesData.map(item => ({
            month: item._id.month,
            quantity: item.totalQuantity || 0
        }));

        const frontendSalesPayload = salesData.map(item => ({
            month: item._id.month,
            year: item._id.year,
            quantity: item.totalQuantity || 0
        }));
        
        console.log(`[FORECAST LOG] Product: ${productId} | Points: ${pythonSalesPayload.length} | Status: Training Initiated`);
        
        // Send POST request to Python API
        const ML_API_URL = 'http://127.0.0.1:5002/forecast';
        try {
            const pythonResponse = await axios.post(ML_API_URL, {
                sales: pythonSalesPayload
            });
            
            console.log(`[FORECAST LOG] Product: ${productId} | Points: ${pythonSalesPayload.length} | Status: Success`);
            
            return res.status(200).json({
                message: pythonResponse.data.message || "Seasonal forecast generated successfully",
                fallback: pythonResponse.data.fallback || false,
                pastSales: frontendSalesPayload,
                predictions: pythonResponse.data.predictions
            });

        } catch (mlError) {
             // 2. Handle Python API Failure safely
             console.log(`[FORECAST LOG] Product: ${productId} | Points: ${pythonSalesPayload.length} | Status: Failed (Python API Error)`);
             return res.status(200).json({ 
                 error: "Forecast service unavailable", 
                 fallback: true,
                 pastSales: frontendSalesPayload,
                 predictions: [] 
             });
        }
        
    } catch (error) {
        console.error("Forecast Error:", error.message);
        res.status(500).json({ error: "Failed to generate seasonal forecast" });
    }
});

module.exports = router;
