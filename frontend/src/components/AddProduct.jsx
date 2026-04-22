import { useState, useEffect } from 'react';
import { addProduct } from '../services/api';

const AddProduct = ({ onProductAdded, prefillData }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        stockQuantity: '',
        reorderLevel: '',
        costPrice: '',
        sellingPrice: '' // Added because Backend Model requires it
    });

    const [message, setMessage] = useState('');

    // Watch for prefillData changes (Restock button clicked)
    useEffect(() => {
        if (prefillData) {
            setFormData({
                name: prefillData.name || '',
                category: prefillData.category || '',
                stockQuantity: '', // User will enter this manually
                reorderLevel: prefillData.reorderLevel !== undefined ? prefillData.reorderLevel : '', // Keep existing reorder level setup
                costPrice: prefillData.costPrice !== undefined ? prefillData.costPrice : '', // Keep cost price to quickly restock
                sellingPrice: prefillData.sellingPrice !== undefined ? prefillData.sellingPrice : '' // Keep selling price 
            });
            setMessage('Form pre-filled. Enter quantity to restock.');
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll user up to the form
        }
    }, [prefillData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            // Basic validation
            if (!formData.name || !formData.stockQuantity || !formData.costPrice || !formData.sellingPrice) {
                setMessage('Error: Please fill all required fields.');
                return;
            }

            // Numeric Validation
            if (Number(formData.stockQuantity) < 0 || Number(formData.reorderLevel) < 0 ||
                Number(formData.costPrice) < 0 || Number(formData.sellingPrice) < 0) {
                setMessage('Error: Values cannot be negative.');
                return;
            }

            await addProduct(formData);
            setMessage('Success: Product added to inventory!');

            // Clear form
            setFormData({
                name: '',
                category: '',
                stockQuantity: '',
                reorderLevel: '',
                costPrice: '',
                sellingPrice: ''
            });

            // Refresh parent list
            if (onProductAdded) {
                onProductAdded();
            }

        } catch (error) {
            setMessage('Error: Failed to add product.');
        }
    };

    return (
        <div className="dark-card" style={{ marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0 }}>➕ Add / Restock Product</h3>

            {message && <p style={{ color: message.includes('Error') ? '#EF4444' : (message.includes('pre-filled') ? '#3B82F6' : '#10B981'), fontWeight: 'bold' }}>{message}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Product Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="dark-input" required />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category</label>
                    <input type="text" name="category" value={formData.category} onChange={handleChange} className="dark-input" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Stock Quantity (Input)</label>
                    <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} className="dark-input" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Alert/Reorder Level</label>
                    <input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} className="dark-input" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cost Price (₹)</label>
                    <input type="number" name="costPrice" value={formData.costPrice} onChange={handleChange} className="dark-input" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Selling Price (₹)</label>
                    <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} className="dark-input" required />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary" style={{ height: '44px', width: '100%', marginTop: 'auto' }}>
                        Add / Restock
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
