import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import API_URL from '../config';

const TeacherDashboard = () => {
  const [studentData, setStudentData] = useState([]);
  const { token } = useAuth();

  const fetchAllData = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/emotions/all-students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStudentData(data);
    } catch (error) {
      console.error('Error fetching all student data:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchAllData]);

  // Aggregate data for visualization
  const getEmotionCounts = () => {
    const counts = {};
    studentData.forEach(entry => {
      counts[entry.emotion] = (counts[entry.emotion] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      emotion: key.charAt(0).toUpperCase() + key.slice(1),
      count: counts[key]
    }));
  };

  const getLatestStudentData = () => {
    const latest = {};
    studentData.forEach(entry => {
      const studentId = entry.studentId?._id;
      if (studentId && !latest[studentId]) {
        latest[studentId] = entry;
      }
    });
    return Object.values(latest);
  };

  const getCriticalAlerts = () => {
    const latestData = getLatestStudentData();
    const criticalEmotions = ['angry', 'sad', 'fearful', 'disgusted'];
    return latestData.filter(entry => 
      criticalEmotions.includes(entry.emotion.toLowerCase()) && entry.confidence > 0.5
    );
  };

  const criticalAlerts = getCriticalAlerts();

  const emotionColors = {
    happy: '#10b981',
    neutral: '#818cf8',
    sad: '#6366f1',
    angry: '#ef4444',
    fearful: '#f59e0b',
    disgusted: '#8b5cf6',
    surprised: '#ec4899'
  };

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Teacher Analytics Portal</h1>
        <p>Comprehensive emotional oversight of all student activities</p>
      </header>

      {criticalAlerts.length > 0 && (
        <section className="card" style={{ borderLeft: '4px solid var(--danger)', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.05)' }}>
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ Critical Student Alerts
          </h3>
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <strong>{alert.studentId?.username}</strong> is currently experiencing high levels of <strong>{alert.emotion}</strong> ({Math.round(alert.confidence * 100)}% confidence).
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  {alert.studentId?.email && <a href={`mailto:${alert.studentId.email}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>📧 Email Student</a>}
                  {alert.studentId?.phone && <a href={`tel:${alert.studentId.phone}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.875rem' }}>📱 Call Student</a>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        <section className="card">
          <h3>Overall Class Emotional Distribution</h3>
          <div style={{ height: '300px', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getEmotionCounts()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="emotion" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(0,0,0,0.05)' }}
                />
                <Bar dataKey="count">
                  {getEmotionCounts().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={emotionColors[entry.emotion.toLowerCase()] || '#818cf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card">
          <h3>Recent Student Activity</h3>
          <div className="table-wrapper" style={{ marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Student</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Emotion</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Confidence</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Score</th>
                  <th style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {studentData.slice(0, 10).map((entry, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: '600' }}>{entry.studentId?.username || 'Unknown'}</td>
                    <td style={{ padding: '0.75rem' }}>{entry.emotion}</td>
                    <td style={{ padding: '0.75rem' }}>{Math.round(entry.confidence * 100)}%</td>
                    <td style={{ padding: '0.75rem', color: 'var(--secondary)' }}>{entry.gameScore}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {entry.studentId?.email && <a href={`mailto:${entry.studentId.email}`} title="Email" style={{ textDecoration: 'none' }}>📧</a>}
                        {entry.studentId?.phone && <a href={`tel:${entry.studentId.phone}`} title="Phone" style={{ textDecoration: 'none' }}>📱</a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeacherDashboard;