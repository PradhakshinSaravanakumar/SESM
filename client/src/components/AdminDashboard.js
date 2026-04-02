import React from 'react';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, Admin!</p>
      </header>
      <UserManagement />
    </div>
  );
};

export default AdminDashboard;