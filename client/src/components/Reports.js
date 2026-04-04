import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_URL from '../config';

const Reports = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reports, setReports] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Fetch students for the dropdown
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emotions/all-students`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          // Get unique students from emotion entries
          const studentMap = new Map();
          data.forEach(entry => {
            if (entry.studentId && entry.studentId._id) {
              studentMap.set(entry.studentId._id, entry.studentId);
            }
          });
          setStudents(Array.from(studentMap.values()));
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    fetchStudents();
  }, [token]);

  const handleGenerateReport = async () => {
    if (!selectedStudent || isGenerating) return;
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/api/emotions/student/${selectedStudent}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const student = students.find(s => s._id === selectedStudent);

        if (student) {
          if (data && data.length > 0) {
            const totalEntries = data.length;
            const avgMood = data.reduce((acc, item) => acc + (item.mood || 0), 0) / totalEntries;
            const avgStress = data.reduce((acc, item) => acc + (item.stress || 0), 0) / totalEntries;
            const avgAnxiety = data.reduce((acc, item) => acc + (item.anxiety || 0), 0) / totalEntries;

            const newReport = {
              id: Date.now(),
              studentName: student.username,
              date: new Date().toLocaleDateString(),
              summary: `Report for ${student.username}: Average mood: ${avgMood.toFixed(1)}/10, Average stress: ${avgStress.toFixed(1)}/10, Average anxiety: ${avgAnxiety.toFixed(1)}/10. Total entries: ${totalEntries}. ${avgStress >= 7 || avgAnxiety >= 7 ? 'Elevated stress levels detected. Recommend counseling session.' : 'Emotional state appears stable.'}`
            };
            setReports([newReport, ...reports]);
          } else {
            const newReport = {
              id: Date.now(),
              studentName: student.username,
              date: new Date().toLocaleDateString(),
              summary: `Report for ${student.username}: No emotional entries found for the selected period.`
            };
            setReports([newReport, ...reports]);
          }
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to generate report:', errorData.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Reports</h1>
        <p>Generate and view student emotional reports</p>
      </div>

      <div className="panel">
        <h3>Generate New Report</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <select 
            value={selectedStudent} 
            onChange={e => setSelectedStudent(e.target.value)}
            className="input"
            style={{ flex: 1, padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}
          >
            <option value="">Select a student...</option>
            {students.map(student => (
              <option key={student._id} value={student._id}>{student.username}</option>
            ))}
          </select>
          <button 
            onClick={handleGenerateReport} 
            className="btn btn-primary"
            disabled={isGenerating || !selectedStudent}
            style={{ 
              backgroundColor: isGenerating || !selectedStudent ? '#94a3b8' : '#3b82f6', 
              color: 'white', 
              padding: '0.75rem 1.5rem', 
              borderRadius: '0.5rem', 
              border: 'none', 
              fontWeight: '600', 
              cursor: isGenerating || !selectedStudent ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      <div className="panel">
        <h3>Available Reports</h3>
        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', marginTop: '1rem' }}>
            <span className="material-icons" style={{ fontSize: 48, color: '#94a3b8' }}>description</span>
            <p style={{ marginTop: '1rem', color: '#64748b' }}>No reports available</p>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Generate a report to get started</p>
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

      <div className="panel">
        <h3>About Reports</h3>
        <p style={{ color: '#64748b', marginTop: '1rem' }}>
          Reports provide a comprehensive overview of a student's emotional well-being over a selected period. They include trends in stress, anxiety, and mood, as well as sleep patterns and other key indicators. Use these reports to identify students who may need support and to track their progress over time.
        </p>
      </div>
    </div>
  );
};

export default Reports;
