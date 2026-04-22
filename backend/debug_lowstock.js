const mongoose = require('mongoose');
const { generateInsights } = require('./utils/insightEngine');
const Product = require('./models/Product');
const Insight = require('./models/Insight');

mongoose.connect('mongodb://127.0.0.1:27018/bca_bi_project').then(async () => {
    console.log("Connected to DB");

    // Check product reorder levels
    const products = await Product.find();
    console.log("\n=== PRODUCTS WITH LOW STOCK ===");
    products.forEach(p => {
        if (p.stockQuantity <= p.reorderLevel) {
            console.log(`${p.name}: Stock=${p.stockQuantity}, ReorderLevel=${p.reorderLevel} *** LOW STOCK ***`);
        } else {
            console.log(`${p.name}: Stock=${p.stockQuantity}, ReorderLevel=${p.reorderLevel}`);
        }
    });

    console.log("\n=== GENERATING INSIGHTS ===");
    const result = await generateInsights();

    console.log("\n=== ACTIVE INSIGHTS ===");
    const allInsights = await Insight.find({ status: 'active' });
    console.log(`Total Active: ${allInsights.length}`);
    allInsights.forEach(i => {
        console.log(`[${i.insightType}] ${i.productName}: ${i.message.substring(0, 100)}...`);
    });

    console.log("\n=== STOCK_RISK INSIGHTS SPECIFICALLY ===");
    const stockRisks = await Insight.find({ insightType: 'STOCK_RISK', status: 'active' });
    console.log(`Total Stock Risks: ${stockRisks.length}`);
    stockRisks.forEach(i => {
        console.log(`- ${i.productName}: ${i.message}`);
    });

    console.log("\nDONE");
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
