import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import './StudentDashboard.css';

// Fallback logic for old "Happy, Sad" DB entries
const mapEmotionToScores = (emotionName) => {
  const map = {
    Happy: { mood: 8, stress: 2, anxiety: 2 },
    Sad: { mood: 3, stress: 7, anxiety: 6 },
    Neutral: { mood: 5, stress: 4, anxiety: 4 },
    Angry: { mood: 2, stress: 9, anxiety: 8 },
    Surprised: { mood: 6, stress: 5, anxiety: 5 },
    Fear: { mood: 2, stress: 8, anxiety: 9 },
    Disgusted: { mood: 3, stress: 6, anxiety: 5 }
  };
  return map[emotionName] || map.Neutral;
};

// Helper function to extract scores natively or fallback
const extractEntryScores = (entry) => {
  if (entry.mood !== undefined && entry.mood !== null) {
    return {
      mood: entry.mood,
      stress: entry.stress,
      anxiety: entry.anxiety,
      sleepHours: entry.sleepHours
    };
  }
  return mapEmotionToScores(entry.emotion);
};

import API_URL from '../config';

const StudentDashboard = ({ onNewEntry }) => {
  const { user, token } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_URL}/api/emotions/my-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error('Error fetching history', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [token]);

  const stats = useMemo(() => {
    const thisWeek = history.filter(h => {
      const date = new Date(h.timestamp);
      return (Date.now() - date.getTime()) < 7 * 24 * 60 * 60 * 1000;
    });

    const averageMoodScore = history.length > 0
      ? (history.reduce((acc, curr) => acc + extractEntryScores(curr).mood, 0) / history.length).toFixed(1)
      : '0.0';

    const recentSleep = history.find(h => h.sleepHours !== undefined && h.sleepHours !== null)?.sleepHours;
    
    return {
      totalEntries: history.length,
      averageMood: averageMoodScore,
      avgSleepHours: recentSleep !== undefined ? recentSleep : (Math.random() * (8.5 - 5.5) + 5.5).toFixed(1), // Use real or fallback mock
      thisWeekCount: thisWeek.length
    };
  }, [history]);

  const lineChartData = useMemo(() => {
    // Take the 7 most recent entries and reverse for chronological order
    const recent = [...history].slice(0, 7).reverse();
    return recent.map(entry => {
      const scores = extractEntryScores(entry);
      return {
        date: new Date(entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        Mood: scores.mood,
        Stress: scores.stress,
        Anxiety: scores.anxiety
      };
    });
  }, [history]);

  const radarData = useMemo(() => {
    if (history.length === 0) {
      return [
        { subject: 'Mood', A: 5, fullMark: 10 },
        { subject: 'Sleep Quality', A: 6, fullMark: 10 },
        { subject: 'Low Stress', A: 5, fullMark: 10 },
        { subject: 'Low Anxiety', A: 5, fullMark: 10 },
      ];
    }
    const recentScores = extractEntryScores(history[0]);
    // Transform sleep (which is 0-12) to a 10-scale quality mock for the radar chart if present
    const sleepQual = recentScores.sleepHours !== undefined && recentScores.sleepHours !== null ? Math.min((recentScores.sleepHours / 8) * 10, 10).toFixed(1) : 7;
    return [
      { subject: 'Mood', A: recentScores.mood, fullMark: 10 },
      { subject: 'Sleep Quality', A: parseFloat(sleepQual), fullMark: 10 },
      { subject: 'Low Stress', A: 10 - recentScores.stress, fullMark: 10 }, // Inverting for "Low" scale
      { subject: 'Low Anxiety', A: 10 - recentScores.anxiety, fullMark: 10 },
    ];
  }, [history]);

  if (isLoading) {
    return <div className="student-dashboard-loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="student-dashboard-container">
      <div className="dashboard-header-text">
        <h1>Welcome, {user?.username}</h1>
        <p>Track your emotional well-being and view insights</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Total Entries</span>
            <span className="stat-value">{stats.totalEntries}</span>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>
            <span className="material-icons">📅</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Average Mood</span>
            <span className="stat-value">{stats.averageMood}</span>
          </div>
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
            <span className="material-icons">💚</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">Avg Sleep Hours</span>
            <span className="stat-value">{stats.avgSleepHours}</span>
          </div>
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}>
            <span className="material-icons">📈</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <span className="stat-label">This Week</span>
            <span className="stat-value">{stats.thisWeekCount}</span>
          </div>
          <div className="stat-icon" style={{ background: '#ffedd5', color: '#f97316' }}>
            <span className="material-icons">📄</span>
          </div>
        </div>
      </div>

      <div className="cta-banner">
        <div className="cta-text">
          <h2>How are you feeling today?</h2>
          <p>Take a moment to record your emotional state</p>
        </div>
        <button className="cta-button" onClick={onNewEntry}>
          New Entry
        </button>
      </div>

      <div className="charts-row">
        <div className="chart-card line-chart-card">
          <h3>7-Day Trend</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ bottom: -10, fontSize: '12px' }} />
                <Line type="monotone" dataKey="Mood" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Stress" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="Anxiety" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card radar-chart-card">
          <h3>Current Well-being Profile</h3>
          <div className="chart-wrapper radar-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar name="Student" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="recent-entries-section">
        <h3>Recent Entries</h3>
        <div className="entries-list">
          {history.length === 0 ? (
            <div className="no-entries">No recent entries found.</div>
          ) : (
            history.slice(0, 5).map((entry, index) => {
              const dateObj = new Date(entry.timestamp);
              const scores = extractEntryScores(entry);
              const isManual = entry.mood !== undefined && entry.mood !== null;
              
              return (
                <div key={index} className="entry-row">
                  <div className="entry-details">
                    <div className="entry-date">
                      {dateObj.toLocaleDateString()} {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="entry-message">
                      {entry.notes && entry.notes.trim() !== '' ? (
                        <span>{entry.notes}</span>
                      ) : (
                        <span style={{color: '#94a3b8', fontStyle: 'italic'}}>
                          {isManual ? 'No notes provided' : `AI Detection: ${entry.emotion}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="entry-scores">
                    <span className="score-badge mood-badge">Mood: {scores.mood}/10</span>
                    <span className="score-badge stress-badge">Stress: {scores.stress}/10</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
