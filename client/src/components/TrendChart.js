import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TrendChart = ({ data }) => {
  // Process data for the chart: format timestamps and pick emotions
  const chartData = [...data].reverse().map(entry => ({
    time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    confidence: Math.round(entry.confidence * 100),
    emotion: entry.emotion,
  }));

  return (
    <div className="chart-wrapper" style={{ height: '250px', width: '100%', marginTop: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem' }}>
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Emotional Confidence Trends</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
          <YAxis stroke="var(--text-muted)" fontSize={12} tick={{ fill: 'var(--text-muted)' }} unit="%" />
          <Tooltip 
            contentStyle={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Legend iconType="circle" />
          <Line 
            type="monotone" 
            dataKey="confidence" 
            name="AI Confidence"
            stroke="#818cf8" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#818cf8' }} 
            activeDot={{ r: 6 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;