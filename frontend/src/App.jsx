import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Predictions from './pages/Predictions';
import ProfitLoss from './pages/ProfitLoss';
import ArtificialIntelligence from './pages/ArtificialIntelligence';
import DemoPanel from './components/DemoPanel';

import SettingsMenu from './components/SettingsMenu';
import logoImg from './assets/Processed_Logo.png';
import nameImg from './assets/Processed_Name.png';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => setIsSidebarOpen(false);

  // Helper for active styling
  const getLinkStyle = ({ isActive }) => ({
    backgroundColor: isActive ? 'var(--bg-hover)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--text-main)'
  });

    return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <DemoPanel />
        {/* MOBILE HEADER - Fixed at the top */}
        <div className="mobile-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoImg} alt="Logo" style={{ height: '28px' }} />
            <img src={nameImg} alt="Name" style={{ height: '16px' }} />
          </div>
          <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)}>☰</button>
        </div>

        {/* ROW WRAPPER FOR SIDEBAR AND MAIN CONTENT */}
        <div className="app-layout" style={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
          
          {/* SIDEBAR OVERLAY FOR MOBILE */}
          <div 
            className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
            onClick={closeSidebar}
          ></div>

          {/* PERMANENT SIDEBAR */}
          <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-title-section">
              <img 
                src={logoImg} 
                alt="Monolith Logo" 
                style={{ height: '32px', width: 'auto' }} 
              />
              <img 
                src={nameImg} 
                alt="Monolith" 
                style={{ height: '18px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>

            <nav className="sidebar-links">
              <NavLink to="/" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>⊞</span> Dashboard
              </NavLink>
              <NavLink to="/inventory" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>📦</span> Inventory
              </NavLink>
              <NavLink to="/sales" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>💰</span> New Sale
              </NavLink>
              <NavLink to="/ai-insights" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>✨</span> AI Insights
              </NavLink>
              <NavLink to="/predictions" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>🔮</span> AI Forecast
              </NavLink>
              <NavLink to="/profit-loss" className="sidebar-link" onClick={closeSidebar} style={getLinkStyle}>
                <span style={{ fontSize: '1.2rem', width: '24px' }}>📈</span> Profit & Loss
              </NavLink>
            </nav>
            
            <div className="sidebar-bottom">
              <SettingsMenu />
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="main-content">
            <div className="content-wrapper">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/ai-insights" element={<ArtificialIntelligence />} />
                <Route path="/profit-loss" element={<ProfitLoss />} />
              </Routes>
            </div>
          </main>
          
        </div>
      </div>
    </Router>
  );
};

export default App;