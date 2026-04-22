const mongoose = require('mongoose');

const InsightSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    insightType: {
        type: String,
        enum: ['DEMAND_SPIKE', 'DEMAND_DROP', 'UPCOMING_PATTERN', 'INACTIVE_STOCK', 'STOCK_RISK', 'SEASONALITY'],
        required: true
    },
    month: {
        type: Number, // 1-12
        required: false // Not all insights are month-specific (e.g. inactive stock)
    },
    percentageChange: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired'],
        default: 'active'
    },
    generatedAt: {
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

// Index to help with deduplication (One active insight per product/type/month)
InsightSchema.index({ productId: 1, insightType: 1, month: 1, status: 1 });

module.exports = mongoose.model('Insight', InsightSchema);
