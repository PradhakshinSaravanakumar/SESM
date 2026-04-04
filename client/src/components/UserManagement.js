import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { token } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [token]);

  const fetchOnlineUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/online-users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setOnlineUsers(data.map(user => user._id));
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchOnlineUsers();

    const interval = setInterval(() => {
      fetchUsers();
      fetchOnlineUsers();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchUsers, fetchOnlineUsers]);

  const handleUpdateUser = async (id, updatedData) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedData)
        }
      );
      const data = await response.json();
      setUsers(users.map(user => (user._id === id ? data : user)));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async id => {
    try {
      await fetch(`${API_URL}/api/admin/users/${id}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setUsers(users.filter(user => user._id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const students = Array.isArray(users) ? users.filter(user => user.role === 'student') : [];
  const faculty = Array.isArray(users) ? users.filter(user => user.role === 'teacher' || user.role === 'faculty' || user.role === 'admin') : [];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Manage students and faculty</p>
      </div>

      <div className="panel">
        <h3>Students</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Username</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{user.username}</td>
                <td style={{ padding: '0.75rem' }}>{user.role}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: onlineUsers.includes(user._id) ? '#10b981' : '#94a3b8' }}></span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button onClick={() => handleUpdateUser(user._id, { role: 'teacher' })}>
                    Make Faculty
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h3>Faculty</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Username</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Role</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Status</th>
              <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {faculty.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <td style={{ padding: '0.75rem', fontWeight: '600' }}>{user.username}</td>
                <td style={{ padding: '0.75rem' }}>{user.role}</td>
                <td style={{ padding: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: onlineUsers.includes(user._id) ? '#10b981' : '#94a3b8' }}></span>
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <button onClick={() => handleUpdateUser(user._id, { role: 'student' })}>
                    Make Student
                  </button>
                  <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;