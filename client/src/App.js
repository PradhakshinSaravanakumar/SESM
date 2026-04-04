import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import StudentLayout from './components/StudentLayout';
import FacultyLayout from './components/FacultyLayout';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout, loading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  if (loading) return <div className="loading-overlay"><div className="spinner"></div></div>;

  if (!user) {
    return isRegistering ? (
      <Register onToggleLogin={() => setIsRegistering(false)} />
    ) : (
      <Login onToggleRegister={() => setIsRegistering(true)} />
    );
  }

  // If user is student, we render the new layout entirely (it has its own top bar and sidebar)
  if (user.role === 'student') {
    return <StudentLayout />;
  }

  // If user is teacher, render FacultyLayout
  if (user.role === 'teacher') {
    return <FacultyLayout />;
  }

  // For other roles, use the old layout structure
  return (
    <div className="App">
      <div className="nav-header card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0.75rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="status-label">Logged in as: <strong>{user.username}</strong> ({user.role})</span>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {user.role === 'admin' ? (
        <AdminDashboard />
      ) : null}
    </div>
  );
}

export default App;