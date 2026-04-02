import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FacultyDashboard from './FacultyDashboard';
import FacultyAlerts from './FacultyAlerts';
import FacultyAnalytics from './FacultyAnalytics';
import Reports from './Reports';
import './FacultyLayout.css';

const FacultyLayout = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FacultyDashboard onNavigate={setActiveTab} />;
      case 'alerts':
        return <FacultyAlerts />;
      case 'analytics':
        return <FacultyAnalytics />;
      case 'reports':
        return <Reports />;
      default:
        return <FacultyDashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="faculty-layout">
      {/* Sidebar */}
      <aside className="faculty-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">
             <span className="material-icons" style={{ color: '#3b82f6' }}>favorite_border</span>
          </div>
          <div className="brand-text">
            <h2>SESMS</h2>
            <p>Student Emotional System</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="material-icons nav-icon">dashboard</span>
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            <span className="material-icons nav-icon">warning_amber</span>
            Alerts
          </button>

          <button 
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="material-icons nav-icon">trending_up</span>
            Analytics
          </button>

          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span className="material-icons nav-icon">description</span>
            Reports
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user?.username?.[0]?.toUpperCase() || 'F'}</div>
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className="user-role">Faculty</span>
            </div>
          </div>
          <button className="logout-button" onClick={logout}>
            <span className="material-icons">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="faculty-main">
        <header className="main-header">
           <div className="header-breadcrumbs">
             {/* Dynamic header title based on active tab can go here, but screens also have their own headers */}
             <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
           </div>
        </header>

        <div className="content-scroll-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default FacultyLayout;
