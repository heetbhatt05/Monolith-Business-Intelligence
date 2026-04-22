import { useEffect, useState } from 'react';
import { fetchSalesAnalytics, fetchProducts, fetchInsights } from '../services/api';
import PageHeader from '../components/PageHeader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const [chartData, setChartData] = useState([]);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [productStats, setProductStats] = useState({ total: 0, lowStock: 0 });
    const [insights, setInsights] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('all'); // Track selected month

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setError('');
        try {
            // Parallel Fetch
            const [salesData, productsData, insightsData] = await Promise.all([
                fetchSalesAnalytics(),
                fetchProducts(),
                fetchInsights()
            ]);

            // --- SALES DATA PROCESSING ---
            // STEP 1: Sort sales by date (oldest → newest)
            // This makes newest dates appear on the RIGHT side of chart (like trading apps)
            const sortedSales = salesData.sort((a, b) => new Date(a._id) - new Date(b._id));

            // STEP 2: Format all sales for chart display (no limit)
            // Shows complete history including time-traveled sales
            const formattedData = sortedSales.map(item => ({
                originalDate: item._id, // Keep "2026-02-10" for month filtering
                date: new Date(item._id).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }), // Shows: "10 Feb 2026" with year
                Revenue: item.totalSales
            }));
            setChartData(formattedData);

            // --- REVENUE CALCULATION ---
            // Sum all daily sales to get total revenue
            const total = salesData.reduce((acc, curr) => acc + curr.totalSales, 0);
            setTotalRevenue(total);

            // --- PRODUCT STATISTICS ---
            // Count total products in inventory
            const totalProducts = productsData.length;

            // Count how many products have low stock alerts
            // Filter: insightType is 'STOCK_RISK' AND status is 'active'
            const lowStockCount = insightsData.filter(
                insight => insight.insightType === 'STOCK_RISK' && insight.status === 'active'
            ).length;

            // Update dashboard cards
            setProductStats({
                total: totalProducts,
                lowStock: lowStockCount
            });

            // Save all insights for display below
            setInsights(insightsData);

        } catch (err) {
            setError('Failed to load dashboard data.');
        }
    };

    return (
        <div>
            <PageHeader title="Executive Dashboard" icon="📊" />

            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>Error: {error}</p>}

            {/* SUMMARY CARDS */}
            <div className="responsive-grid mb-32">
                {/* REVENUE CARD */}
                <div className="dark-card dark-card-revenue">
                    <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Total Revenue</h3>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>₹{totalRevenue.toLocaleString()}</h1>
                </div>

                {/* TOTAL PRODUCTS CARD */}
                <div className="dark-card">
                    <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Total Products</h3>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>{productStats.total}</h1>
                </div>

                {/* LOW STOCK CARD */}
                <div className={`dark-card ${productStats.lowStock > 0 ? 'dark-card-alert' : ''}`}>
                    <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Critical Alerts</h3>
                    <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: productStats.lowStock > 0 ? '#F59E0B' : 'inherit' }}>
                        {productStats.lowStock}
                    </h1>
                </div>
            </div>

            {/* INSIGHTS SECTION */}
            <div className="glass-panel mb-32">
                <h3 style={{ marginTop: 0, color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '10px' }}>✨ Smart Insights Feed</h3>

                {insights.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {insights.map((insight, index) => (
                            <li key={index} style={{ marginBottom: '12px', fontSize: 'clamp(0.85rem, 2.5vw, 1.05rem)', color: '#E2E8F0', lineHeight: '1.5' }}>
                                {insight.message}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-muted" style={{ margin: 0, fontStyle: 'italic' }}>Analyzing data... No patterns detected yet. Add more sales to see insights.</p>
                )}
            </div>

            {/* CHART SECTION */}
            <div className="dark-card" style={{ height: '400px', width: '100%', minWidth: '0' }}>
                <div className="responsive-flex-header" style={{ marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>📈 Sales Performance</h3>

                    {/* Month Filter */}
                    <select
                        value={selectedMonth}
                        className="dark-input"
                        style={{ width: 'auto', padding: '6px 12px' }}
                        disabled={loading}
                        onChange={async (e) => {
                            const month = e.target.value;
                            setSelectedMonth(month);
                            setLoading(true);
                            try {
                                await loadData();
                                if (month !== 'all') {
                                    setChartData(prev => prev.filter(d =>
                                        d.originalDate.includes(`-${month.padStart(2, '0')}-`)
                                    ));
                                }
                            } finally {
                                setLoading(false);
                            }
                        }}
                    >
                        <option value="all">All Months</option>
                        <option value="1">January</option>
                        <option value="2">February</option>
                        <option value="3">March</option>
                        <option value="4">April</option>
                        <option value="5">May</option>
                        <option value="6">June</option>
                        <option value="7">July</option>
                        <option value="8">August</option>
                        <option value="9">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                </div>

                {chartData.length > 0 ? (
                    <div style={{ width: '100%', height: '280px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis dataKey="date" tick={{fill: '#94A3B8', fontSize: 11}} axisLine={false} tickLine={false} dy={10} />
                                <YAxis tick={{fill: '#94A3B8', fontSize: 11}} axisLine={false} tickLine={false} dx={-10} width={40} />
                                <Tooltip 
                                    contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC', fontSize: '0.9rem' }}
                                    itemStyle={{ color: '#06B6D4', fontWeight: 'bold' }} 
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Area type="monotone" dataKey="Revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Sales (₹)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(15, 23, 42, 0.5)',
                        borderRadius: '8px',
                        border: '2px dashed #334155'
                    }}>
                        <div style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>📉</div>
                        <h3 style={{ marginBottom: '10px', color: '#F8FAFC' }}>No sales recorded yet.</h3>
                        <p className="text-muted" style={{ margin: 0 }}>Try selecting a different month or add new sales.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;