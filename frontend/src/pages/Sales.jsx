import { useEffect, useState } from 'react';
import { fetchProducts, recordSale } from '../services/api';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const Sales = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [finalPrice, setFinalPrice] = useState(0); // Store the bargained price
    const [message, setMessage] = useState('');

    // Load products for the dropdown
    useEffect(() => {
        const load = async () => {
            const data = await fetchProducts();
            setProducts(data);
            // Default to first product if available
            if (data.length > 0) {
                setSelectedProductId(data[0]._id);
                setFinalPrice(data[0].sellingPrice); // Initialize with listed price
            }
        };
        load();
    }, []);

    const handleSale = async (e) => {
        e.preventDefault();
        setMessage('Processing...');

        // Validation: Quantity > 0
        if (parseInt(quantity) <= 0 || isNaN(parseInt(quantity))) {
            setMessage('❌ Error: Quantity must be at least 1');
            return;
        }

        // Validation: check stock
        const selectedProduct = products.find(p => p._id === selectedProductId);
        if (selectedProduct) {
            if (parseInt(quantity) > selectedProduct.stockQuantity) {
                setMessage(`❌ Error: Insufficient Stock! Only ${selectedProduct.stockQuantity} available.`);
                return;
            }
        }

        try {
            await recordSale({
                productId: selectedProductId,
                quantity: parseInt(quantity),
                finalPrice: parseFloat(finalPrice) // Send the bargained price
            });

            setMessage('✅ Sale Recorded Successfully! Stock Updated.');
            // Optional: Delay redirect so user sees the message
            setTimeout(() => {
                navigate('/inventory');
            }, 1500);
        } catch (error) {
            setMessage('❌ Error: ' + (error.response?.data?.message || "Failed to record sale"));
        }
    };

    return (
        <div className="glass-panel" style={{ maxWidth: '700px', margin: '0 auto' }}>
            <PageHeader title="New Sale Entry" icon="💰" />

            {products.length === 0 ? (
                <div style={{ marginTop: '20px', padding: '30px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)', border: '2px dashed #334155', borderRadius: '8px', color: '#94A3B8' }}>
                    <h3>No products available.</h3>
                    <p>Add your first product in Inventory before recording a sale.</p>
                </div>
            ) : (
            <form onSubmit={handleSale} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* PRODUCT SELECTION */}
                <label className="dark-label">
                    <strong>Select Product:</strong>
                    <select
                        className="dark-input"
                        style={{ marginTop: '8px' }}
                        value={selectedProductId}
                        onChange={(e) => {
                            setSelectedProductId(e.target.value);
                            const p = products.find(prod => prod._id === e.target.value);
                            if (p) setFinalPrice(p.sellingPrice);
                        }}
                    >
                        {products.map(p => (
                            <option key={p._id} value={p._id}>
                                {p.name} (Stock: {p.stockQuantity}) - Listed: ₹{p.sellingPrice}
                            </option>
                        ))}
                    </select>
                </label>

                {/* ORIGINAL PRICE DISPLAY */}
                {selectedProductId && (() => {
                    const p = products.find(prod => prod._id === selectedProductId);
                    return p ? (
                        <div style={{ background: 'rgba(51, 65, 85, 0.5)', border: '1px solid #334155', padding: '12px', borderRadius: '8px' }}>
                            <strong className="text-muted">Original Listed Price: </strong>
                            <span style={{ fontSize: '1.2em', color: '#F8FAFC', fontWeight: 'bold' }}>₹{p.sellingPrice}</span>
                        </div>
                    ) : null;
                })()}

                {/* FINAL PRICE INPUT (Bargaining) */}
                <label className="dark-label">
                    <strong>Final Selling Price (After Bargaining):</strong>
                    <input
                        type="number"
                        min="0"
                        className="dark-input"
                        style={{ marginTop: '8px', border: '1px solid #3B82F6' }}
                        value={finalPrice}
                        onChange={(e) => setFinalPrice(e.target.value)}
                    />
                    <small className="text-muted" style={{ display: 'block', marginTop: '6px' }}>
                        Discount given: ₹{
                            (() => {
                                const p = products.find(prod => prod._id === selectedProductId);
                                if (!p) return 0;
                                return (p.sellingPrice - finalPrice).toFixed(2);
                            })()
                        }
                    </small>
                </label>

                {/* QUANTITY INPUT */}
                <label className="dark-label">
                    <strong>Quantity:</strong>
                    <input
                        type="number"
                        min="1"
                        className="dark-input"
                        style={{ marginTop: '8px' }}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </label>

                {/* TOTAL SUMMARY */}
                <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10B981', borderRadius: '8px', textAlign: 'center' }}>
                    <strong className="text-muted">Total Collectable Amount:</strong> <br />
                    <span style={{ fontSize: '1.8em', color: '#10B981', fontWeight: 'bold', display: 'block', marginTop: '8px' }}>
                        ₹{(finalPrice * quantity).toFixed(2)}
                    </span>
                </div>

                <button type="submit" disabled={message === 'Processing...'} className="btn-primary" style={{ padding: '12px', fontSize: '1.1rem' }}>
                    {message === 'Processing...' ? '⏳ Processing...' : '✅ Complete Sale'}
                </button>
            </form>
            )}

            {message && (
                <p style={{
                    marginTop: '15px',
                    fontWeight: 'bold',
                    padding: '10px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    background: message.includes('Error') ? '#f8d7da' : '#d4edda',
                    color: message.includes('Error') ? '#721c24' : '#155724'
                }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default Sales;