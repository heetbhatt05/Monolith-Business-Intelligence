const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        // Example: 'Uniform', 'Raw Material', 'Safety Gear'
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    initialStock: {
        type: Number,
        default: 0 // Will clearly show "How many we started with"
    },
    costPrice: {
        type: Number, // Cost to make/buy (Required for Profit Calculation)
        required: true
    },
    sellingPrice: {
        type: Number, // Price sold to customer
        required: true
    },
    reorderLevel: {
        type: Number,
        default: 10
        // BI LOGIC: If stock < reorderLevel, Dashboard shows RED ALERT
    },
    isDemo: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        default: 'system' // 'system' or 'demo'
    }
}, { timestamps: true });
// timestamps: true automatically adds 'createdAt' and 'updatedAt'

module.exports = mongoose.model('Product', ProductSchema);
