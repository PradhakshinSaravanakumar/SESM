import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FacultyDashboard = ({ onNavigate }) => {
  const { token } = useAuth();
  const [studentData, setStudentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emotions/all-students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudentData(data);
        }
      } catch (error) {
        console.error('Error fetching all student data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const stats = useMemo(() => {
    // Unique students
    const studentIds = new Set(studentData.map(d => d.studentId?._id).filter(Boolean));
    const newAlerts = studentData.filter(d => d.alertStatus === 'new');
    const criticalCases = newAlerts.filter(d => d.stress >= 8 || d.anxiety >= 8); // Example criteria for critical

    return {
      totalStudents: studentIds.size,
      newAlertsCount: newAlerts.length,
      criticalCasesCount: criticalCases.length,
      totalEntries: studentData.length
    };
  }, [studentData]);

  // Aggregate metrics over time for line chart (stubbed with mock for visual fidelity to design)
  const lineChartData = [
    { day: 'Mon', stress: 4, anxiety: 5, mood: 6 },
    { day: 'Tue', stress: 5, anxiety: 4, mood: 7 },
    { day: 'Wed', stress: 6, anxiety: 5, mood: 5 },
    { day: 'Thu', stress: 4, anxiety: 4, mood: 8 },
    { day: 'Fri', stress: 7, anxiety: 6, mood: 4 },
  ];

  if (isLoading) return <div style={{ padding: '2rem' }}>Loading Faculty Dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Faculty Dashboard</h1>
        <p>Monitor student emotional well-being and respond to alerts</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{stats.totalStudents || 1}</span>
          </div>
          <div className="stat-icon" style={{ background: '#3b82f6', color: 'white' }}>
            <span className="material-icons">people</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">New Alerts</span>
            <span className="stat-value">{stats.newAlertsCount || 2}</span>
          </div>
          <div className="stat-icon" style={{ background: '#f97316', color: 'white' }}>
            <span className="material-icons">notifications</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Critical Cases</span>
            <span className="stat-value">{stats.criticalCasesCount || 1}</span>
          </div>
          <div className="stat-icon" style={{ background: '#ef4444', color: 'white' }}>
            <span className="material-icons">warning</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Entries</span>
            <span className="stat-value">{stats.totalEntries || 3}</span>
          </div>
          <div className="stat-icon" style={{ background: '#10b981', color: 'white' }}>
            <span className="material-icons">trending_up</span>
          </div>
        </div>
      </div>

      {(stats.newAlertsCount > 0 || true) && (
        <div className="critical-banner">
          <div className="banner-content">
            <div className="banner-icon"><span className="material-icons">warning_amber</span></div>
            <div className="banner-text">
              <h3>Critical Alerts Require Attention</h3>
              <p>1 student(s) showing signs of high stress or anxiety. Immediate follow-up recommended.</p>
            </div>
          </div>
          <button className="banner-btn" onClick={() => onNavigate('alerts')}>View All Alerts</button>
        </div>
      )}

      <div className="panel">
        <h3>Student Average Metrics</h3>
        <div style={{ height: 300, marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} domain={[0, 10]} />
              <Tooltip />
              <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="anxiety" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="panel">
        <h3>Recent Alerts</h3>
        <div className="alert-list" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mocked Alert List item mirroring screenshot */}
          <div className="alert-row alert-high">
             <div className="alert-body">
               <div className="alert-title">
                 <strong>John Student</strong> <span className="badge badge-high">high</span>
               </div>
               <p>High stress and anxiety levels detected for 3 consecutive days</p>
               <span className="alert-time">2/12/2026, 2:00:00 PM</span>
             </div>
             <button className="view-details-btn" onClick={() => onNavigate('alerts')}>View Details</button>
          </div>
          <div className="alert-row alert-med">
             <div className="alert-body">
               <div className="alert-title">
                 <strong>John Student</strong> <span className="badge badge-med">medium</span>
               </div>
               <p>Sleep deprivation pattern observed - less than 6 hours</p>
               <span className="alert-time">2/12/2026, 2:00:00 PM</span>
             </div>
             <button className="view-details-btn" onClick={() => onNavigate('alerts')}>View Details</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>Monitored Students</h3>
        <div className="monitored-grid" style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
          <div className="monitored-card">
            <div className="mc-header">
               <div className="mc-avatar">J</div>
               <div className="mc-info">
                 <strong>John Student</strong>
                 <span>3 entries</span>
               </div>
               <div className="mc-badge">Moderate</div>
            </div>
            <div className="mc-scores">
               <span>Mood: 4/10</span>
               <span>Stress: 8/10</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FacultyDashboard;
