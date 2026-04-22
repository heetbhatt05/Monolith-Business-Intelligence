const mongoose = require('mongoose');
const Product = require('./models/Product');

mongoose.connect('mongodb://127.0.0.1:27018/bca_bi_project').then(async () => {
    console.log("=== PRODUCT REORDER LEVELS ===\n");
    const products = await Product.find().select('name stockQuantity reorderLevel');

    products.forEach(p => {
        const lowStock = p.stockQuantity <= p.reorderLevel ? ' *** LOW STOCK ***' : '';
        console.log(`${p.name.padEnd(20)} Stock: ${String(p.stockQuantity).padStart(3)} | Reorder: ${String(p.reorderLevel).padStart(3)}${lowStock}`);
    });

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
