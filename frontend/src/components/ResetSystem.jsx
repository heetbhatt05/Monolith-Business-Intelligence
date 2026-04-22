import { useState } from 'react';
import { resetSystem } from '../services/api';

const ResetSystem = () => {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        // Double Confirmation for safety
        if (!window.confirm("⚠️ DANGER: Are you sure you want to DELETE ALL DATA? (Inventory & Sales)")) {
            return;
        }
        if (!window.confirm("🔴 FINAL WARNING: This action cannot be undone. Confirm delete?")) {
            return;
        }

        setLoading(true);
        try {
            await resetSystem();
            alert("✅ System Reset Successful. The page will now reload.");
            window.location.reload(); // Reload to clear all states/cache
        } catch (error) {
            alert("❌ Failed to reset system. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ width: '100%' }}>
            <button
                onClick={handleReset}
                disabled={loading}
                style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    textAlign: 'center'
                }}
            >
                {loading ? "Resetting..." : "⚠️ Reset / Clear All Data"}
            </button>
        </div>
    );
};

export default ResetSystem;
