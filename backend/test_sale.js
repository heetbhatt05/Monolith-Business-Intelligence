// This script simulates a Frontend making a purchase
const API_URL = 'http://localhost:5000/api';

async function simulateSale() {
    console.log("🛒 STARTING SALE SIMULATION...");

    // 1. Get List of Products (to find what to sell)
    const productRes = await fetch(`${API_URL}/products/all`);
    const products = await productRes.json();

    if (products.length === 0) {
        console.log("❌ No products found! Run 'node seed.js' first.");
        return;
    }

    const targetProduct = products[0]; // Pick the first product (School Uniform)
    console.log(`📦 SELECTED PRODUCT: ${targetProduct.name}`);
    console.log(`📊 STOCK BEFORE SALE: ${targetProduct.stockQuantity}`);

    // 2. Sell 5 Units
    const sellQty = 5;
    console.log(`💸 ATTEMPTING TO SELL: ${sellQty} units...`);

    const saleResponse = await fetch(`${API_URL}/sales/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            productId: targetProduct._id,
            quantity: sellQty
        })
    });

    const saleResult = await saleResponse.json();

    // 3. Check Results
    if (saleResponse.ok) {
        console.log("\n✅ SALE SUCCESSFUL!");
        console.log(`🧾 Sale ID: ${saleResult.sale._id}`);
        console.log(`💰 Total Amount: ₹${saleResult.sale.totalAmount}`);
        console.log(`📉 STOCK AFTER SALE: ${saleResult.remainingStock}`);
        
        // Validation Logic
        if (saleResult.remainingStock === targetProduct.stockQuantity - sellQty) {
            console.log("✨ LOGIC VERIFIED: Stock reduced correctly.");
        } else {
            console.log("⚠️ LOGIC ERROR: Stock did not update correctly.");
        }
    } else {
        console.log("\n❌ SALE FAILED:", saleResult.message);
    }
}

simulateSale();