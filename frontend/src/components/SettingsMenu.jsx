import { useState, useRef } from 'react';
import ResetSystem from './ResetSystem';
import UndoSale from './UndoSale';
import TimeTravel from './TimeTravel';

const SettingsMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const clickCountRef = useRef(0);
    const clickTimeoutRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
        
        // Handle 5-click hidden trigger
        clickCountRef.current += 1;
        
        if (clickTimeoutRef.current) {
            clearTimeout(clickTimeoutRef.current);
        }
        
        if (clickCountRef.current >= 5) {
            window.dispatchEvent(new Event('openDemoPanel'));
            clickCountRef.current = 0;
            setIsOpen(false);
        } else {
            clickTimeoutRef.current = setTimeout(() => {
                clickCountRef.current = 0;
            }, 2000); // 2 second decay window
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* SETTINGS BUTTON */}
            <button
                onClick={toggleMenu}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    padding: '8px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    textAlign: 'left',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                    backgroundColor: isOpen ? 'var(--bg-hover)' : 'transparent'
                }}
                onMouseOver={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'var(--bg-hover)')}
                onMouseOut={(e) => !isOpen && (e.currentTarget.style.backgroundColor = 'transparent')}
                title="System Settings"
            >
                <span style={{ fontSize: '1.2rem' }}>⚙️</span> Settings
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%', /* pop UP above the button in sidebar */
                    left: '0',
                    marginBottom: '8px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: '12px',
                    padding: '16px',
                    width: '240px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    zIndex: 1000
                }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', borderBottom: '1px solid var(--border-dark)', paddingBottom: '8px', fontWeight: 500 }}>
                        System Settings
                    </h4>

                    {/* RESET COMPONENT (Now inside the menu) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <TimeTravel />
                       <UndoSale />
                       <div style={{ height: '4px' }}></div>
                       <ResetSystem />
                    </div>

                    <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        * Use with caution.
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsMenu;
