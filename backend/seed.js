require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected for Seeding'))
    .catch(err => console.log(err));

const seedProducts = [
    {
        name: "School Uniform (Size M)",
        category: "Uniform",
        stockQuantity: 50,
        costPrice: 400,
        sellingPrice: 650,
        reorderLevel: 20
    },
    {
        name: "Cotton Fabric Roll",
        category: "Raw Material",
        stockQuantity: 5,  // LOW STOCK (Should trigger alert later)
        costPrice: 2000,
        sellingPrice: 0,   // Not for sale directly
        reorderLevel: 10
    },
    {
        name: "Safety Gloves",
        category: "Safety Gear",
        stockQuantity: 100,
        costPrice: 50,
        sellingPrice: 80,
        reorderLevel: 15
    }
];

const seedDB = async () => {
    try {
        await Product.deleteMany({}); // Clear existing data
        await Product.insertMany(seedProducts);
        console.log('✅ 3 Products Added Successfully!');
    } catch (error) {
        console.log('❌ Error:', error);
    } finally {
        mongoose.connection.close(); // Close connection
        console.log('🔌 Connection Closed');
    }
};

seedDB();