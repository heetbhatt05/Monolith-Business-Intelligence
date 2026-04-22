import { useState } from 'react';
import { undoLastSale } from '../services/api';

const UndoSale = () => {
    const [loading, setLoading] = useState(false);

    const handleUndo = async () => {
        if (!window.confirm("⚠️ Testing Feature: Undo the LAST sale?\nVerify that this matches your manual test.")) {
            return;
        }

        setLoading(true);
        try {
            const result = await undoLastSale();
            alert(`✅ Success: ${result.message}\nRestored: ${result.restoredProduct} (+${result.restoredQty})`);
            window.location.reload(); // Reload to show updated stock
        } catch (error) {
            alert("❌ Failed to undo sale. " + (error.response?.data?.message || ""));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%', marginTop: '10px' }}>
            <button
                onClick={handleUndo}
                disabled={loading}
                style={{
                    background: '#ffc107',
                    color: '#333',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                }}
            >
                {loading ? "Undoing..." : "↩️ Undo Last Sale (Testing Only)"}
            </button>
        </div>
    );
};

export default UndoSale;
