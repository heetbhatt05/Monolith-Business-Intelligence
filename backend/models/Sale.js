const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // LINKS to the Product Collection
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    originalPrice: {
        type: Number,
        required: true,
        // The price it was listed at (from Inventory)
    },
    finalPrice: {
        type: Number,
        required: true,
        // The bargaining price the customer actually paid
    },
    discountAmount: {
        type: Number,
        default: 0
        // originalPrice - finalPrice
    },
    totalAmount: {
        type: Number,
        required: true
        // finalPrice * quantity
    },
    saleDate: {
        type: Date,
        default: Date.now
    },
    isDemo: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        default: 'system' // 'system' or 'demo'
    }
});

module.exports = mongoose.model('Sale', SaleSchema);