const mongoose = require('mongoose');
const { generateInsights } = require('./utils/insightEngine');
const timeStore = require('./utils/timeStore');

// Connect to DB (Use the same connection string as server.js)
mongoose.connect('mongodb://127.0.0.1:27018/bca_bi_project').then(async () => {
    console.log("Connected to DB");

    // Mock Time (Optional: jump forward if needed)
    // timeStore.addMonths(2); 

    const saleCount = await require('./models/Sale').countDocuments();
    console.log(`Total Sales in DB: ${saleCount}`);

    console.log("Generating Insights...");
    const result = await generateInsights();

    console.log("--- RESULTS ---");
    console.log("Active Insights Found:", result.insights.length);
    result.insights.forEach(i => {
        console.log(`[${i.insightType}] ${i.productName}: ${i.message} (${i.percentageChange}%)`);
    });

    console.log("DONE");
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
