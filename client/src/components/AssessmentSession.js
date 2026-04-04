import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as faceapi from 'face-api.js';
import API_URL from '../config';
import './AssessmentForm.css';

const AssessmentSession = ({ onComplete }) => {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    mood: 5,
    stress: 5,
    anxiety: 5,
    sleepHours: 7,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI State
  const videoRef = useRef();
  const canvasRef = useRef();
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState(null);
  const [aiDetectedEmotion, setAiDetectedEmotion] = useState('Neutral');
  const [aiConfidence, setAiConfidence] = useState(1.0);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = window.location.origin + '/models';
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setIsModelsLoaded(true);
      } catch (error) {
        console.error('Error loading models:', error);
        setLoadingError(`Failed to load AI models.`);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    let currentStream = null;
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        currentStream = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
      }
    };
    if (isModelsLoaded) {
      startVideo();
    }
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelsLoaded]);

  useEffect(() => {
    let intervalId;
    if (isModelsLoaded && videoRef.current) {
      intervalId = setInterval(async () => {
        if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;
        
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const topEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
          setAiDetectedEmotion(topEmotion.charAt(0).toUpperCase() + topEmotion.slice(1));
          setAiConfidence(expressions[topEmotion]);
          
          if (canvasRef.current) {
            const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
            faceapi.matchDimensions(canvasRef.current, displaySize);
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
          }
        }
      }, 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isModelsLoaded]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/emotions/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          emotion: aiDetectedEmotion,
          confidence: aiConfidence,
          timestamp: new Date()
        }),
      });
      if (response.ok) {
        onComplete();
      } else {
        console.error('Failed to save assessment');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <button className="back-btn" onClick={onComplete}>
          <span className="material-icons">←</span>
        </button>
        <div>
          <h2>New Emotional Entry</h2>
          <p>Record your current emotional state</p>
        </div>
      </div>

      <div className="assessment-split-layout">
        
        {/* Left Side: AI Webcam */}
        <div className="assessment-ai-sidebar">
          <div className="ai-status">
            <h3>Live AI Detection</h3>
            {isModelsLoaded ? (
               <div className="active-emotion-badge">
                 {aiDetectedEmotion} ({Math.round(aiConfidence * 100)}%)
               </div>
            ) : (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{loadingError || 'Loading AI Models...'}</div>
            )}
          </div>
          <div className="webcam-box">
             <video ref={videoRef} autoPlay muted playsInline></video>
             <canvas ref={canvasRef}></canvas>
          </div>
          <p className="ai-description">Ensure your face is clearly visible. The AI captures your facial expressions and stores this baseline alongside your manual entry when you save.</p>
        </div>

        {/* Right Side: Form */}
        <div className="assessment-form-card">
          {/* Mood Slider */}
          <div className="form-section">
            <div className="section-header">
              <div className="label-group">
                <div className="icon-wrapper mood-icon">
                  <span className="material-icons">♡</span>
                </div>
                <div className="label-text">
                  <h3>Mood Level</h3>
                  <p>How are you feeling overall?</p>
                </div>
              </div>
              <div className="score-display mood-score">
                {formData.mood}/10
              </div>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" max="10" 
                value={formData.mood}
                onChange={(e) => handleChange('mood', parseInt(e.target.value))}
                className="styled-slider mood-slider"
              />
              <div className="slider-labels">
                <span>Very Low</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Stress Slider */}
          <div className="form-section">
            <div className="section-header">
              <div className="label-group">
                <div className="icon-wrapper stress-icon">
                  <span className="material-icons">⚡</span>
                </div>
                <div className="label-text">
                  <h3>Stress Level</h3>
                  <p>How stressed do you feel?</p>
                </div>
              </div>
              <div className="score-display stress-score">
                {formData.stress}/10
              </div>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" max="10" 
                value={formData.stress}
                onChange={(e) => handleChange('stress', parseInt(e.target.value))}
                className="styled-slider stress-slider"
              />
              <div className="slider-labels">
                <span>No Stress</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Anxiety Slider */}
          <div className="form-section">
            <div className="section-header">
              <div className="label-group">
                <div className="icon-wrapper anxiety-icon">
                  <span className="material-icons">⚡</span>
                </div>
                <div className="label-text">
                  <h3>Anxiety Level</h3>
                  <p>How anxious do you feel?</p>
                </div>
              </div>
              <div className="score-display anxiety-score">
                {formData.anxiety}/10
              </div>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" max="10" 
                value={formData.anxiety}
                onChange={(e) => handleChange('anxiety', parseInt(e.target.value))}
                className="styled-slider anxiety-slider"
              />
              <div className="slider-labels">
                <span>No Anxiety</span>
                <span>Very High</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Sleep Hours Slider */}
          <div className="form-section">
            <div className="section-header">
              <div className="label-group">
                <div className="icon-wrapper sleep-icon">
                  <span className="material-icons">☽</span>
                </div>
                <div className="label-text">
                  <h3>Sleep Hours</h3>
                  <p>How many hours did you sleep last night?</p>
                </div>
              </div>
              <div className="score-display sleep-score">
                {formData.sleepHours}h
              </div>
            </div>
            <div className="slider-container">
              <input 
                type="range" 
                min="0" max="12" step="0.5"
                value={formData.sleepHours}
                onChange={(e) => handleChange('sleepHours', parseFloat(e.target.value))}
                className="styled-slider sleep-slider"
              />
              <div className="slider-labels">
                <span>0h</span>
                <span>12h+</span>
              </div>
            </div>
          </div>

          <hr className="divider" />

          {/* Notes */}
          <div className="form-section">
            <div className="section-header">
              <div className="label-group">
                <div className="icon-wrapper notes-icon">
                  <span className="material-icons">📄</span>
                </div>
                <div className="label-text">
                  <h3>Additional Notes</h3>
                  <p>Any thoughts or concerns you'd like to share?</p>
                </div>
              </div>
            </div>
            <textarea 
              className="notes-textarea"
              placeholder="Optional: Describe what's affecting your emotional state today..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button className="btn btn-cancel" onClick={onComplete} disabled={isSubmitting}>
              Cancel
            </button>
            <button className="btn btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSession;
