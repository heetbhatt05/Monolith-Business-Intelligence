const mongoose = require('mongoose');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const Insight = require('../models/Insight');
const timeStore = require('../utils/timeStore');

// Generate realistic demo data
const generateDemoData = async (monthsToGenerate) => {
    try {
        // 1. Duplicate Generation Protection
        const existingDemo = await Sale.findOne({ isDemo: true });
        if (existingDemo) {
            return { success: false, message: 'Demo data already exists. Please clear it first before generating again.' };
        }

        // 2. Fetch existing products or create demo ones
        let products = await Product.find();
        if (products.length === 0) {
            const demoProducts = [
                { name: 'Demo Laptop Pro', category: 'Electronics', stockQuantity: 200, costPrice: 45000, sellingPrice: 55000, isDemo: true, source: 'demo', reorderLevel: 10 },
                { name: 'Demo Ergonomic Chair', category: 'Furniture', stockQuantity: 100, costPrice: 5000, sellingPrice: 8000, isDemo: true, source: 'demo', reorderLevel: 5 },
                { name: 'Demo Water Bottle', category: 'Accessories', stockQuantity: 300, costPrice: 200, sellingPrice: 500, isDemo: true, source: 'demo', reorderLevel: 20 }
            ];
            products = await Product.insertMany(demoProducts);
        }

        const currentDate = timeStore.getCurrentDate();
        let totalSalesGenerated = 0;

        // 3. Generate Sales for each product
        for (const product of products) {
            // Determine base volume
            const historySales = await Sale.find({ product: product._id });
            let baseDailyQuantity = 0;
            
            if (historySales.length > 0) {
                const totalUnits = historySales.reduce((acc, curr) => acc + curr.quantity, 0);
                baseDailyQuantity = Math.max(1, Math.floor(totalUnits / historySales.length));
            } else {
                baseDailyQuantity = Math.floor(Math.random() * 26) + 15; // Random Base: 15 to 40
            }

            // Decide spike and drop months
            const spikeMonthIndex = Math.floor(Math.random() * monthsToGenerate);
            let dropMonthIndex = Math.floor(Math.random() * monthsToGenerate);
            while (dropMonthIndex === spikeMonthIndex && monthsToGenerate > 1) {
                dropMonthIndex = Math.floor(Math.random() * monthsToGenerate);
            }

            for (let i = 0; i < monthsToGenerate; i++) {
                // Calculate historical month
                const targetDate = new Date(currentDate);
                targetDate.setMonth(targetDate.getMonth() - (monthsToGenerate - i - 1));

                // 3-6 transactions per month
                const txCount = Math.floor(Math.random() * 4) + 3;

                for (let t = 0; t < txCount; t++) {
                    let multiplier = 1;
                    if (i === spikeMonthIndex) {
                        multiplier = 1 + (Math.random() * 0.2 + 0.4); // Spike: +40% to +60%
                    } else if (i === dropMonthIndex) {
                        multiplier = 1 - (Math.random() * 0.2 + 0.3); // Drop: -30% to -50%
                    }

                    let quantityToSell = Math.max(1, Math.floor(baseDailyQuantity * multiplier));

                    // STOCK SAFETY: Fix requested by User
                    // We must ensure generated sales do not reduce stock to negative
                    if (product.stockQuantity < quantityToSell) {
                       const safeBoost = quantityToSell + 50; 
                       await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: safeBoost, initialStock: safeBoost } });
                       product.stockQuantity += safeBoost; 
                    }

                    // Perform sale logic
                    const discountPercent = Math.random() * 0.1; // Max 10% discount
                    const discountAmount = Math.floor(product.sellingPrice * discountPercent);
                    const finalPrice = product.sellingPrice - discountAmount;

                    // TIME DISTRIBUTION: Fix requested by User
                    // Limit random day to 1-28 to avoid month-ending constraints cleanly
                    const randomDay = Math.floor(Math.random() * 28) + 1;
                    targetDate.setDate(randomDay);

                    const newSale = new Sale({
                        product: product._id,
                        quantity: quantityToSell,
                        originalPrice: product.sellingPrice,
                        finalPrice: finalPrice,
                        discountAmount: discountAmount,
                        totalAmount: finalPrice * quantityToSell,
                        saleDate: new Date(targetDate),
                        isDemo: true,
                        source: 'demo'
                    });

                    await newSale.save();
                    
                    // Reduce volatile memory stock reference for subsequent loops
                    product.stockQuantity -= quantityToSell;

                    // Update actual database stock
                    await Product.findByIdAndUpdate(product._id, { $inc: { stockQuantity: -quantityToSell } });

                    totalSalesGenerated++;
                }
            }
        }

        return { success: true, message: `Successfully generated ${totalSalesGenerated} background sales over ${monthsToGenerate} months.` };
    } catch (err) {
        console.error("Demo Generation Error:", err);
        return { success: false, message: 'Server error generating demo data', error: err.message };
    }
};

const clearDemoData = async () => {
    try {
        // Clear strictly isDemo logic
        await Sale.deleteMany({ isDemo: true });
        await Insight.deleteMany({ isDemo: true }); // Catch any stray demo insights if algorithms tagged them
        
        const demoProducts = await Product.find({ isDemo: true });
        const demoIds = demoProducts.map(p => p._id);

        if (demoIds.length > 0) {
            await Product.deleteMany({ isDemo: true });
            await Sale.deleteMany({ product: { $in: demoIds } });
            await Insight.deleteMany({ productId: { $in: demoIds } });
        }

        return { success: true, message: 'All demo data securely cleared.' };
    } catch (err) {
        console.error("Demo Clearing Error:", err);
        return { success: false, message: 'Server error clearing demo data', error: err.message };
    }
};

module.exports = {
    generateDemoData,
    clearDemoData
};
