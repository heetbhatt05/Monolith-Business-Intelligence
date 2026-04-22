import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DemoPanel = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };

        const handleCustomEvent = () => {
            setIsOpen(true);
        };

        // UI Event Hooks for Safety and Removal
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('openDemoPanel', handleCustomEvent);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('openDemoPanel', handleCustomEvent);
        };
    }, []);

    const handleGenerate = async (months) => {
        if (!window.confirm(`Are you sure you want to safely generate ${months} months of demo data?`)) return;
        
        setLoading(true);
        setStatusMessage({ text: 'Generating Background Data... Please wait.', type: 'info' });

        try {
            const res = await axios.post('http://localhost:5000/api/demo/generate', { months });
            setStatusMessage({ text: res.data.message, type: 'success' });
            setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setStatusMessage({ text: err.response?.data?.message || 'Error generating demo data.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        if (!window.confirm('WARNING: Are you sure you want to clear all Demo data? This action isolates and removes only generic payload items.')) return;
        
        setLoading(true);
        setStatusMessage({ text: 'Clearing system demo data...', type: 'info' });

        try {
            const res = await axios.delete('http://localhost:5000/api/demo/clear');
            setStatusMessage({ text: res.data.message, type: 'success' });
            setTimeout(() => setStatusMessage({ text: '', type: '' }), 5000);
        } catch (err) {
            setStatusMessage({ text: err.response?.data?.message || 'Error clearing demo data.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '24px',
                position: 'relative'
            }}>
                <button 
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: 'none',
                        color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem'
                    }}
                >
                    ✕
                </button>
                
                <h2 style={{ marginTop: 0, borderBottom: '1px solid var(--border-dark)', paddingBottom: '12px', fontSize: '1.2rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>🧪</span> Secret Demo Generator
                </h2>

                {statusMessage.text && (
                    <div style={{
                        padding: '12px',
                        marginBottom: '16px',
                        borderRadius: '6px',
                        backgroundColor: statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: statusMessage.type === 'error' ? '#EF4444' : statusMessage.type === 'success' ? '#10B981' : '#3B82F6',
                        border: `1px solid ${statusMessage.type === 'error' ? '#EF4444' : statusMessage.type === 'success' ? '#10B981' : '#3B82F6'}`,
                        fontSize: '0.9rem'
                    }}>
                        {statusMessage.text}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
                    <button 
                        className="btn-primary" 
                        onClick={() => handleGenerate(6)}
                        disabled={loading}
                        style={{ height: '44px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? 'Processing...' : 'Generate 6 Months Data'}
                    </button>
                    <button 
                        className="btn-primary" 
                        onClick={() => handleGenerate(12)}
                        disabled={loading}
                        style={{ height: '44px', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? 'Processing...' : 'Generate 12 Months Data'}
                    </button>
                    
                    <div style={{ height: '1px', background: 'var(--border-dark)', margin: '8px 0' }}></div>
                    
                    <button 
                        className="btn-primary" 
                        onClick={handleClear}
                        disabled={loading}
                        style={{ height: '44px', backgroundColor: 'transparent', border: '1px solid #EF4444', color: '#EF4444', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                    >
                        {loading ? 'Processing...' : 'Clear Demo Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DemoPanel;
