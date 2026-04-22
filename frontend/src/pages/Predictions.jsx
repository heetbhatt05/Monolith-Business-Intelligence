import { useState, useEffect } from 'react';
import { fetchPrediction, fetchProducts, fetchSeasonalForecast } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';

const Predictions = () => {
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [discount, setDiscount] = useState(0);
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [historyInfo, setHistoryInfo] = useState(null);

    // Seasonal Forecast State
    const [seasonalData, setSeasonalData] = useState(null);
    const [forecastLoading, setForecastLoading] = useState(false);
    const [forecastMsg, setForecastMsg] = useState('');

    // 1. Load Real Inventory
    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchProducts();
                setProducts(data);
                if (data.length > 0) setSelectedProductId(data[0]._id);
            } catch (err) {
                setError("Failed to load products.");
            }
        };
        load();
    }, []);

    // 2. Submit to AI Simulation
    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setPrediction(null);
        setHistoryInfo(null);

        try {
            const payload = {
                productId: selectedProductId,
                discount: parseFloat(discount)
            };

            const result = await fetchPrediction(payload);

            // Handle both old and new API response formats
            const estimate = result.simulatedDemandEstimate || result.predictedRevenue;

            if (estimate !== undefined) {
                setPrediction(estimate);
                setHistoryInfo(result.basedOnHistory);
            } else {
                setError("AI did not return a valid result.");
            }
        } catch (err) {
            setError("Failed to connect to AI Service.");
        } finally {
            setLoading(false);
        }
    };

    // 3. Seasonal Forecast
    const handleSeasonalForecast = async () => {
        if (!selectedProductId) return;
        setForecastLoading(true);
        setForecastMsg('');
        setSeasonalData(null);
        try {
            const result = await fetchSeasonalForecast(selectedProductId);
            
            if (result.predictions && result.predictions.length > 0) {
                const combined = [];
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                
                if (result.pastSales && result.pastSales.length > 0) {
                    const firstSale = result.pastSales[0];
                    const lastSale = result.pastSales[result.pastSales.length - 1];
                    let currentY = firstSale.year;
                    let currentM = firstSale.month;

                    // Fill missing past months sequentially to ensure chronological continuity in the chart (actual: 0)
                    while (currentY < lastSale.year || (currentY === lastSale.year && currentM <= lastSale.month)) {
                        const matched = result.pastSales.find(s => s.year === currentY && s.month === currentM);
                        combined.push({
                            month: `${monthNames[currentM - 1]} '${currentY.toString().slice(-2)}`, // Output creates unique label: "Mar '25"
                            actual: matched ? matched.quantity : 0,
                            predicted: null
                        });

                        currentM++;
                        if (currentM > 12) {
                            currentM = 1;
                            currentY++;
                        }
                    }

                    // Hand-off overlap for visual line continuity between actual -> predicted
                    if (combined.length > 0) {
                        combined[combined.length - 1].predicted = combined[combined.length - 1].actual;
                    }

                    // Map predictions with properly flowing sequential year assignments
                    let predY = lastSale.year;
                    let predM = lastSale.month;

                    result.predictions.forEach(item => {
                        predM++;
                        if (predM > 12) {
                            predM = 1;
                            predY++;
                        }
                        combined.push({
                            month: `${monthNames[predM - 1]} '${predY.toString().slice(-2)}`,
                            actual: null,
                            predicted: item.predicted
                        });
                    });
                }
                
                setSeasonalData(combined);
                
                if (result.fallback) {
                    setForecastMsg("👉 Using limited data — predictions may be approximate");
                } else {
                    setForecastMsg(result.message || "Forecast generated successfully");
                }
            } else {
                setForecastMsg(result.message || result.error || "No sufficient sales data available for forecasting");
            }
        } catch (err) {
            setForecastMsg("Error fetching seasonal forecast.");
        } finally {
            setForecastLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <PageHeader title="What-If Demand Simulator" icon="🔮" />
            <p className="glass-panel mb-24" style={{ padding: '16px', color: '#fbbf24', border: '1px solid #F59E0B' }}>
                <strong style={{ color: '#F59E0B' }}>⚠️ Note:</strong> This tool performs a <strong>generic demand simulation</strong> using a pretrained retail ML model.
                It is <strong>NOT product-specific forecasting</strong>.
                Actual business decisions are driven by <strong>sales analytics and rule-based insights</strong>.
            </p>

            {products.length === 0 ? (
                <div style={{ marginTop: '20px', padding: '30px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)', border: '2px dashed #334155', borderRadius: '8px', color: '#94A3B8' }}>
                    <h3>Not enough data for prediction.</h3>
                    <p>Please add products and record sales to unlock AI insights.</p>
                </div>
            ) : (
            <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>

                {/* PRODUCT DROPDOWN */}
                <label className="dark-label">
                    <strong className="text-muted">Select Product:</strong>
                    <select
                        className="dark-input"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '5px' }}
                    >
                        {products.map(p => (
                            <option key={p._id} value={p._id}>
                                {p?.name || 'Unnamed Product'} (Category: {p?.category || 'N/A'})
                            </option>
                        ))}
                    </select>
                </label>

                {/* DISCOUNT INPUT */}
                <label className="dark-label">
                    <strong className="text-muted">Simulated Discount (0.0 - 0.8):</strong>
                    <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="0.8"
                        className="dark-input"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        style={{ display: 'block', width: '100%', marginTop: '5px' }}
                    />
                    <small className="text-muted">Example: 0.10 = 10% discount scenario</small>
                </label>

                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', fontSize: '1.1rem' }}>
                    {loading ? "⏳ Running Simulation..." : "🔮 Run Simulation"}
                </button>
            </form>
            )}

            {/* RESULTS DISPLAY */}
            {prediction !== null && (
                <div className="glass-panel" style={{ marginTop: '20px', border: '1px solid #10B981', color: '#10B981', textAlign: 'center' }}>
                    <h3 className="text-muted">Simulated Demand Estimate:</h3>
                    <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', margin: '10px 0', color: '#10B981' }}>₹{prediction.toFixed(2)}</h1>

                    {historyInfo && (
                        <p className="text-muted" style={{ fontSize: '0.95rem', marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                            Based on {historyInfo.totalTransactions || historyInfo.transactionCount || 0} historical transactions<br />
                            Average transaction size: {historyInfo.averageTransactionSize || (historyInfo.totalSoldSoFar / (historyInfo.transactionCount || 1)).toFixed(2)} units
                        </p>
                    )}

                    <p style={{ fontSize: '0.85rem', marginTop: '10px', color: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)', padding: '8px', borderRadius: '4px' }}>
                        ⚠️ Generic simulation only. Not for inventory decisions.
                    </p>
                </div>
            )}

            {error && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f8d7da', color: '#721c24', textAlign: 'center' }}>
                    <strong>Error:</strong> {error}
                </div>
            )}

            {/* SEASONAL DEMAND FORECAST */}
            <div style={{ marginTop: '50px', paddingTop: '30px', borderTop: '1px solid #334155' }}>
                <h2 className="responsive-flex-header" style={{ margin: '0 0 10px 0' }}>
                    <span><span style={{ fontSize: '1.5rem' }}>📈</span> Seasonal Demand Forecast</span>
                </h2>
                <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '20px' }}>
                    Analyses historical sales using Linear Regression & Cyclic Encoding to predict the next 6 months of demand.
                </p>
                
                <button 
                    onClick={handleSeasonalForecast} 
                    disabled={forecastLoading || !selectedProductId} 
                    style={{ 
                        padding: '12px 24px', 
                        background: 'linear-gradient(135deg, #00b09b, #96c93d)', 
                        color: 'white', 
                        border: 'none', 
                        cursor: forecastLoading || !selectedProductId ? 'not-allowed' : 'pointer', 
                        fontSize: '1rem', 
                        fontWeight: 'bold',
                        borderRadius: '30px', 
                        boxShadow: '0 4px 15px rgba(0, 176, 155, 0.4)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => !forecastLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => !forecastLoading && (e.currentTarget.style.transform = 'translateY(0)')}
                >
                    {forecastLoading ? "⏳ Generating Forecast..." : "📊 Generate Seasonal Forecast"}
                </button>
                
                {forecastMsg && (
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '12px 15px', 
                        background: forecastMsg.includes('Error') || forecastMsg.includes('No sufficient') ? '#fdf2f2' : (forecastMsg.includes('approximate') ? '#fff8e1' : '#f0fdf4'), 
                        borderLeft: `4px solid ${forecastMsg.includes('Error') || forecastMsg.includes('No sufficient') ? '#e74c3c' : (forecastMsg.includes('approximate') ? '#ffc107' : '#2ecc71')}`,
                        borderRadius: '4px',
                        color: forecastMsg.includes('Error') || forecastMsg.includes('No sufficient') ? '#c0392b' : (forecastMsg.includes('approximate') ? '#f39c12' : '#27ae60'),
                        fontWeight: 'bold' 
                    }}>
                        {forecastMsg}
                    </div>
                )}
                
                {seasonalData && (
                    <div style={{ 
                        marginTop: '25px', 
                        width: '100%', 
                        height: '400px', 
                        backgroundColor: '#1E293B', 
                        padding: '20px 20px 10px 0', 
                        borderRadius: '16px', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                        border: '1px solid #334155'
                    }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={seasonalData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                                <defs>
                                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 13}} dx={-10} />
                                <Tooltip 
                                    contentStyle={{ background: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#F8FAFC' }}
                                    itemStyle={{ fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: '500', color: '#F8FAFC' }} />
                                <Line 
                                    type="monotone" 
                                    dataKey="actual" 
                                    stroke="#3B82F6" 
                                    name="Actual Sales" 
                                    strokeWidth={4} 
                                    dot={{r: 5, strokeWidth: 2, fill: '#0F172A'}}
                                    activeDot={{r: 8, stroke: '#3B82F6', strokeWidth: 2}}
                                    connectNulls 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="predicted" 
                                    stroke="#F59E0B" 
                                    name="👉 Predicted Demand (ML-based)" 
                                    strokeDasharray="6 6" 
                                    strokeWidth={4} 
                                    dot={{r: 5, strokeWidth: 2, fill: '#0F172A'}}
                                    activeDot={{r: 8, stroke: '#F59E0B', strokeWidth: 2}}
                                    connectNulls 
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Predictions;
