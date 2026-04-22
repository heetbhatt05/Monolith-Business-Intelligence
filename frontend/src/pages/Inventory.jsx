import { useEffect, useState } from 'react';
import { fetchProducts } from '../services/api';
import AddProduct from '../components/AddProduct';
import PageHeader from '../components/PageHeader';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');
    const [restockData, setRestockData] = useState(null);
    const [visibleCount, setVisibleCount] = useState(10);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch (err) {
            setError('Failed to load inventory data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <PageHeader title="Inventory Management" icon="📦" />

            {error && <p style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>Error: {error}</p>}

            {/* ADD PRODUCT FORM */}
            <AddProduct onProductAdded={loadData} prefillData={restockData} />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#94A3B8' }}>⏳ Loading data...</div>
            ) : products.length === 0 ? (
                <div className="dark-card" style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', border: '2px dashed #334155' }}>
                    <h3 style={{ marginBottom: '10px', color: '#F8FAFC' }}>No products available.</h3>
                    <p style={{ margin: 0 }}>Add your first product above to get started.</p>
                </div>
            ) : (
                <>
                <div className="table-container mb-24">
                <table className="dark-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>History (In | Sold | Now)</th>
                            <th>Reorder Level</th>
                            <th>Status</th>
                            <th>Cost</th>
                            <th>Selling</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.slice(0, visibleCount).map((product) => (
                            <tr key={product._id}>
                                <td style={{ fontWeight: 'bold' }}>{product.name}</td>
                                <td className="text-muted">{product.category}</td>

                                {/* MOVEMENT ANALYTICS */}
                                <td>
                                    <span style={{ color: '#3B82F6' }}>In: {product.initialStock || 0}</span>
                                    <span style={{ margin: '0 8px', color: '#334155' }}>|</span>
                                    <span style={{ color: '#EF4444' }}>Sold: {product.totalSold || 0}</span>
                                    <span style={{ margin: '0 8px', color: '#334155' }}>|</span>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: product.stockQuantity < product.reorderLevel ? '#F59E0B' : '#10B981'
                                    }}>
                                        Rem: {product.stockQuantity}
                                    </span>
                                </td>

                                {/* REORDER LEVEL */}
                                <td style={{
                                    fontWeight: 'bold',
                                    color: '#ff6b00',
                                    textAlign: 'center'
                                }}>
                                    {product.reorderLevel || 'Not Set'}
                                </td>

                                <td>
                                    {product.stockQuantity === 0 ? (
                                        <span className="badge-red">
                                            Out of Stock
                                        </span>
                                    ) : product.stockQuantity < product.reorderLevel ? (
                                        <span className="badge-orange">
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="badge-green">
                                            Good
                                        </span>
                                    )}
                                </td>

                                <td style={{ color: '#3B82F6' }}>₹{product.costPrice}</td>
                                <td style={{ color: '#10B981', fontWeight: 'bold' }}>₹{product.sellingPrice}</td>
                                <td>
                                    <button 
                                        onClick={() => setRestockData(product)}
                                        className="btn-primary"
                                        style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                                        title="Auto-fill form for quick restock"
                                    >
                                        🛒 Restock
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
                {products.length > visibleCount && (
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <button 
                            className="btn-primary" 
                            onClick={() => setVisibleCount(prev => prev + 10)}
                        >
                            Load More Results
                        </button>
                    </div>
                )}
                </>
            )}
        </div>
    );
};

export default Inventory;