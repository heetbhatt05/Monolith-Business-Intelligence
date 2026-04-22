import { useState, useEffect } from 'react';
import axios from 'axios';

const TimeTravel = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api/test/time';

    const fetchTime = async () => {
        try {
            const res = await axios.get(`${API_URL}/current`);
            setCurrentDate(new Date(res.data.currentSimulatedDate));
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTime();
    }, []);

    const travel = async (type) => {
        setLoading(true);
        try {
            const endpoint = type === 'day' ? '/add-day' : (type === 'month' ? '/add-month' : '/reset');
            const res = await axios.post(`${API_URL}${endpoint}`);
            setCurrentDate(new Date(res.data.currentSimulatedDate));
            alert(`✅ Time Travelled! \nSystem Date is now: ${new Date(res.data.currentSimulatedDate).toDateString()}`);
            window.location.reload(); // Reload to refresh charts if they depend on date
        } catch (error) {
            alert("Failed to travel time");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '10px', background: '#e2e3e5', borderRadius: '5px', marginBottom: '10px' }}>
            <h5 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#333' }}>
                ⏳ Time Machine (Testing)
            </h5>
            <div style={{ fontSize: '0.8rem', marginBottom: '5px', color: '#555' }}>
                Current: <strong>{currentDate.toDateString()}</strong>
            </div>

            <div style={{ display: 'flex', gap: '5px' }}>
                <button
                    onClick={() => travel('day')} disabled={loading}
                    style={{ flex: 1, padding: '5px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    +1 Day
                </button>
                <button
                    onClick={() => travel('month')} disabled={loading}
                    style={{ flex: 1, padding: '5px', fontSize: '0.8rem', cursor: 'pointer' }}
                >
                    +1 Mo
                </button>
                <button
                    onClick={() => travel('reset')} disabled={loading}
                    style={{ flex: 1, padding: '5px', fontSize: '0.8rem', cursor: 'pointer', background: '#6c757d', color: 'white', border: 'none' }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

export default TimeTravel;
