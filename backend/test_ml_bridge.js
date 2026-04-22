const axios = require('axios');

async function testBrain() {
    console.log("🧠 TESTING AI CONNECTION (FINAL ATTEMPT)...");

    try {
        // FIX: Send FLAT data. No "features" wrapper.
        // This matches exactly what the Python DataFrame expects.
        const response = await axios.post('http://localhost:5000/api/predict/sales', {
            "Category": "Furniture",
            "Sub-Category": "Chairs",
            "Region": "West",
            "Segment": "Consumer",
            "Ship Mode": "Standard Class",
            "Quantity": 5,
            "Discount": 0.2,
            "Profit": 10
        });

        console.log("✅ SUCCESS! The Brain Responded:");
        // console.log(JSON.stringify(response.data, null, 2));

        if(response.data.result.status === 'success') {
            console.log("🚀 PREDICTED SALES: ₹" + response.data.result.predicted_sales);
        } else {
            console.log("⚠️ Model Error:", response.data.result.message);
        }

    } catch (error) {
        console.log("❌ CONNECTION FAILED");
        if (error.response) {
            console.log("Server Error:", error.response.status, error.response.data);
        } else {
            console.log("Error Message:", error.message);
        }
    }
}

testBrain();