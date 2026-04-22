import { useEffect, useState } from 'react';
import { fetchProfitLoss } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';

const ProfitLoss = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const result = await fetchProfitLoss();
            setData(result);
        } catch (err) {
            setError('Failed to load Profit & Loss data.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>⏳ Loading financial data...</div>;
    if (error) return <div style={{ padding: '20px', color: '#EF4444', textAlign: 'center', background: '#fdf2f2', border: '1px solid #EF4444', borderRadius: '8px' }}>{error}</div>;

    const noSales = !data || (data.overall.revenue === 0 && data.overall.cost === 0);

    return (
        <div>
            <PageHeader title="Profit & Loss" icon="💰" />
            <p className="text-secondary mb-24">Overview of business revenue, costs, and profit margins.</p>
            
            {noSales ? (
                <div className="dark-card" style={{ padding: '40px 20px', textAlign: 'center', border: '2px dashed #334155', color: '#94A3B8' }}>
                    <h3 style={{ marginBottom: '10px', color: '#F8FAFC' }}>No financial data available.</h3>
                    <p style={{ margin: 0 }}>Record some sales to view your Profit & Loss breakdown.</p>
                </div>
            ) : (
                <>
                    {/* SECTION 1: OVERALL SUMMARY */}
                    <div className="responsive-grid mb-32">
                        <div className="dark-card dark-card-revenue">
                            <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Total Revenue</h3>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>₹{data.overall.revenue.toLocaleString()}</h1>
                        </div>
                        <div className="dark-card dark-card-alert">
                            <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Total Cost</h3>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>₹{data.overall.cost.toLocaleString()}</h1>
                        </div>
                        <div className="dark-card" style={{ borderTop: data.overall.profit >= 0 ? '4px solid #10B981' : '4px solid #F59E0B' }}>
                            <h3 className="text-muted" style={{ margin: '0 0 10px 0' }}>Total Profit</h3>
                            <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: data.overall.profit >= 0 ? '#10B981' : '#F59E0B' }}>₹{data.overall.profit.toLocaleString()}</h1>
                        </div>
                    </div>

                    {/* SECTION 2: CATEGORY-WISE BREAKDOWN */}
                    <div className="dark-card mb-32">
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📂 Category-wise Breakdown</h3>
                        <div className="table-container" style={{ border: 'none', background: 'transparent' }}>
                            <table className="dark-table">
                                <thead>
                                    <tr>
                                        <th>Category Name</th>
                                        <th>Revenue</th>
                                        <th>Cost</th>
                                        <th>Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.categories?.map((cat, idx) => (
                                        <tr key={idx}>
                                            <td style={{ fontWeight: 'bold' }}>{cat?.category || 'Unknown'}</td>
                                            <td style={{ color: '#3B82F6' }}>₹{(cat?.revenue || 0).toLocaleString()}</td>
                                            <td style={{ color: '#EF4444' }}>₹{(cat?.cost || 0).toLocaleString()}</td>
                                            <td style={{ color: (cat?.profit || 0) >= 0 ? '#10B981' : '#F59E0B', fontWeight: 'bold' }}>
                                                ₹{(cat?.profit || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* BAR CHART: PROFIT PER CATEGORY */}
                    {data.categories.length > 0 && (
                        <div className="dark-card" style={{ height: '400px', minWidth: '0', overflow: 'hidden' }}>
                            <h3 style={{ marginTop: 0 }}>📊 Profit Margin by Category</h3>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={data.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="category" tick={{fill: '#94A3B8'}} axisLine={false} tickLine={false} />
                                    <YAxis tick={{fill: '#94A3B8'}} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#F8FAFC' }} />
                                    <Legend />
                                    <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Net Profit (₹)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProfitLoss;
