import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const EmotionHistory = () => {
  const [history, setHistory] = useState([]);
  const { token } = useAuth();

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/emotions/my-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setHistory(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (error) {
      console.error('Error fetching emotion history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const intervalId = setInterval(fetchHistory, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="history-container" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Recent Session Trends</h3>
      <div className="table-wrapper" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Time</th>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Emotion</th>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Conf.</th>
              <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry, index) => (
              <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-muted)' }}>
                  {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: entry.emotion === 'happy' ? '#10b981' : 'var(--text-main)' }}>
                  {entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1)}
                </td>
                <td style={{ padding: '0.75rem 0.5rem' }}>
                  {Math.round(entry.confidence * 100)}%
                </td>
                <td style={{ padding: '0.75rem 0.5rem', color: 'var(--secondary)' }}>
                  {entry.gameScore}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No session data available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmotionHistory;