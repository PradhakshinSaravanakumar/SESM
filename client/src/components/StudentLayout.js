import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import AssessmentSession from './AssessmentSession';
import StudentReports from './StudentReports';
import './StudentLayout.css';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'assessment', 'reports'

  return (
    <div className="student-layout">
      {/* Sidebar Navigation */}
      <nav className="student-sidebar">
        <div className="sidebar-header">
          <div className="logo-icon">♡</div>
          <div className="logo-text">
            <h2>SESMS</h2>
            <p>Student Emotional System</p>
          </div>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="icon">㗊</span> Dashboard
          </li>
          <li 
            className={`menu-item ${currentView === 'assessment' ? 'active' : ''}`}
            onClick={() => setCurrentView('assessment')}
          >
            <span className="icon">♡</span> New Entry
          </li>
          <li 
            className={`menu-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentView('reports')}
          >
            <span className="icon">📄</span> My Reports
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <h4>{user?.username}</h4>
              <p>Student</p>
            </div>
          </div>
          <button onClick={logout} className="logout-btn-sidebar">
            <span className="icon">➜</span> Logout
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="student-main-content">
        <header className="main-header">
          <div className="date-display">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </header>

        <div className="content-container">
          {currentView === 'dashboard' && <StudentDashboard onNewEntry={() => setCurrentView('assessment')} />}
          {currentView === 'assessment' && <AssessmentSession onComplete={() => setCurrentView('dashboard')} />}
          {currentView === 'reports' && <StudentReports />}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
