import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const FacultyAlerts = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emotions/all-students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const flaggedData = data.filter(d => d.alertStatus && d.alertStatus !== 'none');
        // Sort newest first
        flaggedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setAlerts(flaggedData);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const updateAlertStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/emotions/alert-status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        fetchAlerts(); // Refresh to move it to the right tab
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const newAlerts = alerts.filter(a => a.alertStatus === 'new');
  const ackAlerts = alerts.filter(a => a.alertStatus === 'acknowledged');
  const resAlerts = alerts.filter(a => a.alertStatus === 'resolved');

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading Alerts...</div>;

  const AlertCard = ({ alert }) => {
    const isCritical = alert.stress >= 8 || alert.anxiety >= 8 || alert.emotion === 'Fear' || alert.emotion === 'Angry';
    const badgeClass = isCritical ? 'badge-high' : 'badge-med';
    const badgeText = isCritical ? 'high' : 'medium';
    const rowClass = isCritical ? 'alert-high' : 'alert-med';

    return (
      <div className={`alert-row ${rowClass}`} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="alert-title">
              <strong>{alert.studentId?.username || 'Unknown Student'}</strong> <span className={`badge ${badgeClass}`}>{badgeText}</span>
            </div>
            <p>
              {alert.notes ? `Student note: "${alert.notes}"` : `High emotional stress detected (Stress: ${alert.stress || 'N/A'}, Mood: ${alert.mood || 'N/A'})`}
            </p>
            <span className="alert-time">Triggered: {new Date(alert.timestamp).toLocaleString()}</span>
          </div>
          <div style={{ color: isCritical ? '#ef4444' : '#f59e0b' }}>
            <span className="material-icons">warning_amber</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          {alert.alertStatus === 'new' && (
            <button className="view-details-btn" onClick={() => updateAlertStatus(alert._id, 'acknowledged')}>
              Acknowledge
            </button>
          )}
          {alert.alertStatus !== 'resolved' && (
            <button className="view-details-btn" style={{ background: '#22c55e', color: 'white', border: 'none' }} onClick={() => updateAlertStatus(alert._id, 'resolved')}>
              Mark Resolved
            </button>
          )}
          <button className="view-details-btn" style={{ background: '#3b82f6', color: 'white', border: 'none' }} onClick={() => window.location.href = `mailto:${alert.studentId?.email || ''}`}>
            Contact Student
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Alert Management</h1>
        <p>Monitor and respond to student emotional health alerts</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">New Alerts</span>
            <span className="stat-value">{newAlerts.length}</span>
          </div>
          <div className="stat-icon" style={{ background: '#ef4444', color: 'white' }}>
            <span className="material-icons">warning_amber</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Acknowledged</span>
            <span className="stat-value">{ackAlerts.length}</span>
          </div>
          <div className="stat-icon" style={{ background: '#f59e0b', color: 'white' }}>
            <span className="material-icons">schedule</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Resolved</span>
            <span className="stat-value">{resAlerts.length}</span>
          </div>
          <div className="stat-icon" style={{ background: '#10b981', color: 'white' }}>
            <span className="material-icons">check_circle_outline</span>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>New Alerts</h3>
        <div className="alert-list">
          {newAlerts.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No new alerts</div>
          ) : (
            newAlerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Acknowledged Alerts</h3>
        <div className="alert-list">
          {ackAlerts.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No acknowledged alerts</div>
          ) : (
            ackAlerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
          )}
        </div>
      </div>

      <div className="panel">
        <h3>Resolved Alerts</h3>
        <div className="alert-list">
          {resAlerts.length === 0 ? (
            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No resolved alerts</div>
          ) : (
            resAlerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
          )}
        </div>
      </div>

    </div>
  );
};

export default FacultyAlerts;
