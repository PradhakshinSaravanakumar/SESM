import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './FacultyLayout.css'; // Reusing the same panel and card styles

const StudentReports = () => {
  const { token, user } = useAuth();
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    // Check if user has any data to generate reports
    const checkData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/emotions/my-history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHasData(data.length > 0);
        }
      } catch (error) {
        console.error('Error checking history:', error);
      }
    };
    checkData();
  }, [token]);

  const handleGenerateReport = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:5000/api/emotions/my-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();

        if (data && data.length > 0) {
          const totalEntries = data.length;
          const avgMood = data.reduce((acc, item) => acc + (item.mood || 0), 0) / totalEntries;
          const avgStress = data.reduce((acc, item) => acc + (item.stress || 0), 0) / totalEntries;
          const avgAnxiety = data.reduce((acc, item) => acc + (item.anxiety || 0), 0) / totalEntries;

          const newReport = {
            id: Date.now(),
            studentName: user.username,
            date: new Date().toLocaleDateString(),
            summary: `Personal Report: Average mood: ${avgMood.toFixed(1)}/10, Average stress: ${avgStress.toFixed(1)}/10, Average anxiety: ${avgAnxiety.toFixed(1)}/10. Total entries: ${totalEntries}. ${avgStress >= 7 || avgAnxiety >= 7 ? 'Your stress levels are currently high. We recommend taking a break or speaking with a counselor.' : 'Your emotional state appears stable. Keep it up!'}`
          };
          setReports([newReport, ...reports]);
        }
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '0' }}>
      <div className="page-header">
        <h1>My Reports</h1>
        <p>View your personal emotional stability summaries</p>
      </div>

      <div className="panel">
        <h3>Generate New Report</h3>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
          Generate a summary of your emotional well-being based on your recorded entries.
        </p>
        <button 
          onClick={handleGenerateReport} 
          className="btn btn-primary"
          disabled={isGenerating || !hasData}
          style={{ 
            backgroundColor: isGenerating || !hasData ? '#94a3b8' : '#3b82f6', 
            color: 'white', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '0.5rem', 
            border: 'none', 
            fontWeight: '600', 
            cursor: isGenerating || !hasData ? 'not-allowed' : 'pointer'
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate My Report'}
        </button>
        {!hasData && (
          <p style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            You need to complete at least one assessment to generate a report.
          </p>
        )}
      </div>

      <div className="panel">
        <h3>Available Reports</h3>
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem' }}>
            <span className="material-icons" style={{ fontSize: 48, color: '#94a3b8' }}>description</span>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>No reports available</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Click the button above to generate your first report.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            {reports.map(report => (
              <div key={report.id} className="report-card">
                <div className="report-header">
                  <div className="report-icon">
                    <span className="material-icons">description</span>
                  </div>
                  <div className="report-title">
                    <h4>Monthly Summary</h4>
                    <div className="report-meta">
                      <span><span className="material-icons">person</span> {report.studentName}</span>
                      <span><span className="material-icons">calendar_today</span> {report.date}</span>
                    </div>
                  </div>
                  <button className="report-download-btn">
                    <span className="material-icons">download</span>
                  </button>
                </div>
                <div className="report-body">
                  <p>{report.summary}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReports;
