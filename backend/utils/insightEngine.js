const Sale = require('../models/Sale');
const Product = require('../models/Product');
const Insight = require('../models/Insight');
const timeStore = require('../utils/timeStore');

/**
 * ADVANCED INSIGHT ENGINE (PERSISTENT & RECURRING)
 * Analyzes sales history and stores insights in MongoDB.
 */
const generateInsights = async () => {
    try {
        const seasonalMap = {};

        // 1. FETCH AGGREGATED DATA
        const salesDistribution = await Sale.aggregate([
            {
                $group: {
                    _id: {
                        product: "$product",
                        month: { $month: "$saleDate" }
                    },
                    totalQty: { $sum: "$quantity" },
                    totalRevenue: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id.month": 1 } }
        ]);

        // 2. FETCH PRODUCTS (including reorderLevel for stock alerts)
        const products = await Product.find({}, 'name category stockQuantity reorderLevel');
        const productMap = products.reduce((acc, p) => {
            acc[p._id.toString()] = p;
            return acc;
        }, {});

        // 3. PROCESS DATA PER PRODUCT
        const productStats = {};
        salesDistribution.forEach(record => {
            const pid = record._id.product.toString();
            if (!productStats[pid]) {
                productStats[pid] = { totalQty: 0, distinctMonths: 0, monthlyData: [] };
            }
            productStats[pid].totalQty += record.totalQty;
            productStats[pid].distinctMonths += 1;
            productStats[pid].monthlyData.push({ month: record._id.month, qty: record.totalQty });
        });

        // --- BATCH OPERATIONS ARRAY ---
        const operations = [];

        // Current Simulated Month
        const simulatedDate = timeStore.getCurrentDate();
        const currentMonth = simulatedDate.getMonth() + 1; // 1-12
        let nextMonthIndex = currentMonth + 1;
        if (nextMonthIndex > 12) nextMonthIndex = 1;

        // 4. RULE-BASED DETECTION & DB PREPARATION
        const insightTypesOfInterest = ['DEMAND_SPIKE', 'DEMAND_DROP', 'UPCOMING_PATTERN'];

        // Helper to queue updates
        const queueUpdate = (pid, type, month, status, message = "", change = 0) => {
            const filter = { productId: pid, insightType: type, month: month };
            const updateDoc = {
                $set: {
                    status: status, // 'active' or 'expired'
                    generatedAt: simulatedDate
                }
            };
            if (status === 'active') {
                updateDoc.$set.message = message;
                updateDoc.$set.percentageChange = change;
                updateDoc.$set.productName = productMap[pid]?.name || "Unknown";
            }
            operations.push({ updateOne: { filter, update: updateDoc, upsert: true } });
        };

        Object.keys(productStats).forEach(pid => {
            const stats = productStats[pid];
            const pName = productMap[pid] ? productMap[pid].name : "Unknown Item";

            // CRITICAL FIX: Calculate average for each month EXCLUDING that month itself
            // This prevents the bug where adding sales to March makes the drop % worse
            stats.monthlyData.forEach(m => {
                const monthLabel = `Month ${m.month}`;

                // Calculate average of OTHER months (exclude current month)
                const otherMonthsTotal = stats.totalQty - m.qty;
                const otherMonthsCount = stats.distinctMonths - 1;

                // If only 1 month exists, use total average (no other months to compare)
                const avgOtherMonths = otherMonthsCount > 0
                    ? otherMonthsTotal / otherMonthsCount
                    : stats.totalQty / stats.distinctMonths;

                const ratio = m.qty / avgOtherMonths;
                const pctChange = ((ratio - 1) * 100).toFixed(0);

                // A. SPIKE DETECTION
                // Scenario 1: multiple months of data (Ratio > 1.1)
                if (stats.distinctMonths > 1) {
                    if (ratio > 1.1 && m.qty > 1) {
                        // Seasonal Map
                        if (!seasonalMap[pid]) seasonalMap[pid] = [];
                        seasonalMap[pid].push({ month: monthLabel, qty: m.qty, factor: ratio.toFixed(1) + "x" });

                        queueUpdate(pid, 'DEMAND_SPIKE', m.month, 'active',
                            `📈 Demand Spike Detected: "${pName}" shows a ${pctChange}% increase in turnover during ${monthLabel}.`, Number(pctChange));

                        // RECURRENCE
                        if (m.month === nextMonthIndex) {
                            queueUpdate(pid, 'UPCOMING_PATTERN', m.month, 'active',
                                `🔮 Upcoming Pattern: Historical data indicates higher demand for "${pName}" during the upcoming Month ${m.month}.`, Number(pctChange));
                        }
                    } else {
                        queueUpdate(pid, 'DEMAND_SPIKE', m.month, 'expired');
                        if (m.month === nextMonthIndex) queueUpdate(pid, 'UPCOMING_PATTERN', m.month, 'expired');
                    }
                }
                // Scenario 2: Single Month "Strong Start" (Cold Start Fix)
                else if (stats.distinctMonths === 1 && m.qty >= 3) { // Threshold: 3 sales
                    if (!seasonalMap[pid]) seasonalMap[pid] = [];
                    seasonalMap[pid].push({ month: monthLabel, qty: m.qty, factor: "New" });

                    queueUpdate(pid, 'DEMAND_SPIKE', m.month, 'active',
                        `🚀 Successful Launch: "${pName}" is performing well with ${m.qty} units sold in its first active month.`, 100);
                }

                // B. DEMAND DROP DETECTION (< 0.7x)
                // Only detect drops if we have other months to compare against
                if (stats.distinctMonths > 1 && ratio < 0.7) {
                    queueUpdate(pid, 'DEMAND_DROP', m.month, 'active',
                        `📉 Demand Drop Detected: Sales for "${pName}" are ${Math.abs(pctChange)}% lower than average during ${monthLabel}. Risk detected.`, Number(pctChange));
                } else {
                    // If condition NOT met, expire any existing drop
                    queueUpdate(pid, 'DEMAND_DROP', m.month, 'expired');
                }
            });
        });

        // D. INACTIVE STOCK (Formerly Dead Stock)
        products.forEach(p => {
            const pid = p._id.toString();
            // If NO sales recorded in the window
            if (!productStats[pid] && p.stockQuantity > 0) {
                operations.push({
                    updateOne: {
                        filter: { productId: pid, insightType: 'INACTIVE_STOCK' },
                        update: {
                            $set: {
                                productName: p.name,
                                message: `⚠️ Inactive Inventory: "${p.name}" has recorded zero sales. Review allocation.`,
                                status: 'active',
                                generatedAt: simulatedDate
                            }
                        },
                        upsert: true
                    }
                });
            } else {
                // If sales EXIST now, expire the Inactive Stock warning
                operations.push({
                    updateOne: {
                        filter: { productId: pid, insightType: 'INACTIVE_STOCK' },
                        update: { $set: { status: 'expired' } }
                    }
                });
            }
        });

        // E. STOCK RISK (Enhanced with Reorder Level + Auto-Expiry)
        products.forEach(p => {
            const pid = p._id.toString();
            const stats = productStats[pid];

            let shouldAlert = false;
            let alertMessage = '';

            // Check 1: Stock below reorder level (CRITICAL)
            if (p.reorderLevel && p.stockQuantity <= p.reorderLevel && p.stockQuantity > 0) {
                shouldAlert = true;
                alertMessage = `🚨 Critical: "${p.name}" stock (${p.stockQuantity} units) is BELOW reorder level (${p.reorderLevel}). Immediate restocking required!`;
            }
            // Check 2: Stock below average monthly sales (WARNING)
            else if (stats) {
                const avgMonthlySales = stats.totalQty / (stats.distinctMonths || 1);
                if (p.stockQuantity < avgMonthlySales && p.stockQuantity > 0) {
                    shouldAlert = true;
                    alertMessage = `⚠️ Warning: "${p.name}" stock (${p.stockQuantity} units) is BELOW average monthly sales (${avgMonthlySales.toFixed(1)} units/month). Stock may run out before month ends - consider restocking.`;
                }
            }

            // ACTION: Create/Update OR Expire
            if (shouldAlert) {
                // Stock is low - create or update alert
                operations.push({
                    updateOne: {
                        filter: { productId: pid, insightType: 'STOCK_RISK' },
                        update: {
                            $set: {
                                productName: p.name,
                                message: alertMessage,
                                status: 'active',
                                generatedAt: simulatedDate
                            }
                        },
                        upsert: true
                    }
                });
            } else {
                // Stock is healthy - expire any existing alerts
                operations.push({
                    updateOne: {
                        filter: { productId: pid, insightType: 'STOCK_RISK' },
                        update: { $set: { status: 'expired' } }
                    }
                });
            }
        });

        // 5. EXECUTE BULK WRITE
        if (operations.length > 0) {
            await Insight.bulkWrite(operations);
        }

        // 6. RETURN ACTIVE INSIGHTS FOR API
        // Fetch fresh from DB
        const activeInsights = await Insight.find({ status: 'active' })
            .sort({ generatedAt: -1 })
            .limit(10);

        return { insights: activeInsights, seasonalSummary: seasonalMap };

    } catch (error) {
        console.error("Insight Engine Persistence Error:", error);
        return { insights: [], seasonalSummary: {} };
    }
};

module.exports = { generateInsights };
