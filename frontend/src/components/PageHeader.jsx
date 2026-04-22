import React, { useState, useEffect } from 'react';
import axios from 'axios';

let cachedDateStr = null;
let lastFetchTime = 0;
const CACHE_DURATION = 10000; // 10 seconds

const PageHeader = ({ title, icon }) => {
    const [dateStr, setDateStr] = useState(cachedDateStr || '');
    const [loading, setLoading] = useState(!cachedDateStr);

    useEffect(() => {
        const fetchDate = async () => {
            const now = Date.now();
            if (cachedDateStr && (now - lastFetchTime < CACHE_DURATION)) {
                setDateStr(cachedDateStr);
                setLoading(false);
                return;
            }

            try {
                const res = await axios.get('http://localhost:5000/api/test/time/current', { timeout: 3000 });
                const d = new Date(res.data.currentSimulatedDate);
                const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                cachedDateStr = formatted;
                lastFetchTime = now;
                setDateStr(formatted);
            } catch (err) {
                const d = new Date();
                const formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                cachedDateStr = formatted;
                lastFetchTime = now;
                setDateStr(formatted);
            } finally {
                setLoading(false);
            }
        };

        fetchDate();
    }, []);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '16px',
            borderBottom: '1px solid var(--border-dark)', 
            paddingBottom: '16px',
            marginBottom: '24px'
        }}>
            <h2 style={{ margin: 0, display: 'flex', gap: '12px', alignItems: 'center' }}>
                {icon && <span style={{ fontSize: '1.4rem' }}>{icon}</span>}
                {title}
            </h2>
            
            <div style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.9rem', backgroundColor: 'var(--bg-hover)', padding: '6px 14px', borderRadius: '8px' }}>
                {loading ? (
                    <div style={{ width: '100px', height: '20px', backgroundColor: 'var(--border-dark)', borderRadius: '4px' }} title="Fetching time..." />
                ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📅</span> {dateStr}
                    </span>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
