import React from 'react';

const StabilityScore = ({ history }) => {
  // Simple stability calculation:
  // Happy/Neutral: +10
  // Surprised: +5
  // Sad/Fearful/Angry/Disgusted: -10
  // Each entry is weighted by its confidence
  
  const calculateScore = () => {
    if (history.length === 0) return 100; // Start at 100
    
    let score = 100;
    history.forEach(entry => {
      const confidence = entry.confidence;
      const emotion = entry.emotion.toLowerCase();
      
      if (['happy', 'neutral'].includes(emotion)) {
        score += (10 * confidence);
      } else if (emotion === 'surprised') {
        score += (5 * confidence);
      } else if (['sad', 'fearful', 'angry', 'disgusted'].includes(emotion)) {
        score -= (15 * confidence);
      }
    });
    
    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const score = calculateScore();
  const getStatusColor = () => {
    if (score > 75) return '#10b981'; // Stable
    if (score > 40) return '#f59e0b'; // Warning
    return '#ef4444'; // Unstable
  };

  return (
    <div className="stability-meter" style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '0.75rem' }}>
      <span className="status-label">Overall Stability Score</span>
      <div style={{ fontSize: '3rem', fontWeight: '900', color: getStatusColor(), transition: 'color 0.5s ease' }}>
        {score}%
      </div>
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        {score > 75 ? 'Optimal Focus State' : score > 40 ? 'Slight Stress Detected' : 'Support Recommended'}
      </div>
    </div>
  );
};

export default StabilityScore;