const express = require('express');
const router = express.Router();
const Product = require('../models/Product'); // Import the Schema we just made

// @route   POST /api/products/add
// @desc    Add a new product to Inventory
// @access  Public (for now)
router.post('/add', async (req, res) => {
    try {
        // 1. Destructure data
        const { name, category, stockQuantity, costPrice, sellingPrice, reorderLevel } = req.body;

        // 2. CHECK IF PRODUCT EXISTS (Name + Category)
        // We use a RegExp for case-insensitive matching if desired, or simple string match.
        // For strict duplicate prevention as requested:
        let product = await Product.findOne({ name: name, category: category });

        if (product) {
            // --- UPDATE EXISTING PRODUCT ---
            // 3a. Update Stock
            product.stockQuantity = Number(product.stockQuantity) + Number(stockQuantity);
            // Also update initialStock to reflect the "Total Ever In" count
            product.initialStock = Number(product.initialStock || 0) + Number(stockQuantity);

            // 3b. Update Prices (Optional but good practice to keep latest)
            product.costPrice = costPrice;
            product.sellingPrice = sellingPrice;
            product.reorderLevel = reorderLevel;

            const updatedProduct = await product.save();

            // ✅ TRIGGER INSIGHT ENGINE: Auto-expire low stock alerts if restocked
            const { generateInsights } = require('../utils/insightEngine');
            await generateInsights();

            return res.status(200).json({
                message: "Product Stock Updated Successfully (Merged with existing)",
                product: updatedProduct
            });

        } else {
            // --- CREATE NEW PRODUCT ---
            // 4. Create new Product object
            const newProduct = new Product({
                name,
                category,
                stockQuantity,
                initialStock: stockQuantity, // Set initial history point
                costPrice,
                sellingPrice,
                reorderLevel
            });

            // 5. Save to MongoDB
            const savedProduct = await newProduct.save();

            // ✅ TRIGGER INSIGHT ENGINE: Generate fresh insights
            const { generateInsights } = require('../utils/insightEngine');
            await generateInsights();

            // 6. Send success response
            return res.status(201).json({
                message: "New Product Added Successfully",
                product: savedProduct
            });
        }

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// @route   GET /api/products/all
// @desc    Get all products
// @access  Public
router.get('/all', async (req, res) => {
    try {
        // AGGREGATION PIPELINE:
        // We want: Product Details + Total Units Sold from Sales Collection
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'sales',            // Join with 'sales' collection
                    localField: '_id',        // Product._id
                    foreignField: 'product',  // Sale.product
                    as: 'salesData'           // Output array
                }
            },
            {
                $addFields: {
                    totalSold: { $sum: "$salesData.quantity" } // Sum up the quantity sold
                }
            },
            {
                $project: {
                    salesData: 0, // Remove heavy sales array from output
                    __v: 0        // Remove version key
                }
            }
        ]);

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

module.exports = router;