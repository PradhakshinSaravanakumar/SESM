const express = require('express');
const router = express.Router();
const EmotionData = require('../models/EmotionData');
const { auth, authorize } = require('../middleware/auth');

// Save emotion data (Students & Manual Entry)
router.post('/save', auth, authorize('student'), async (req, res) => {
  try {
    const { emotion, confidence, gameScore, mood, stress, anxiety, sleepHours, notes } = req.body;
    
    // Provide defaults for AI payload variables if missing during manual submission
    const defaultEmotion = emotion || 'Self-Reported';
    const defaultConfidence = confidence !== undefined ? confidence : 1.0;

    // Auto-compute alert status
    let autoAlertStatus = 'none';
    const isCriticalEmotion = ['Angry', 'Fear', 'Fearful', 'Sad', 'Disgusted'].includes(defaultEmotion);
    if (
      (stress !== undefined && stress >= 7) || 
      (anxiety !== undefined && anxiety >= 7) || 
      (mood !== undefined && mood <= 3) ||
      (isCriticalEmotion && defaultConfidence > 0.6)
    ) {
      autoAlertStatus = 'new';
    }

    const newData = new EmotionData({ 
      emotion: defaultEmotion, 
      confidence: defaultConfidence, 
      gameScore, 
      mood,
      stress,
      anxiety,
      sleepHours,
      notes,
      alertStatus: autoAlertStatus,
      studentId: req.user._id 
    });
    await newData.save();
    res.status(201).json({ message: 'Emotion data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save emotion data', message: err.message });
  }
});

// Update alert status (For Faculty)
router.put('/alert-status/:id', auth, authorize('teacher'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updatedEntry = await EmotionData.findByIdAndUpdate(
      req.params.id, 
      { alertStatus: status },
      { new: true }
    );
    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Alert status updated', entry: updatedEntry });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', message: err.message });
  }
});

// Get own emotion data (Students)
router.get('/my-history', auth, authorize('student'), async (req, res) => {
  try {
    const data = await EmotionData.find({ studentId: req.user._id }).sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve your emotion data', message: err.message });
  }
});

// Get all student emotion data (Only teachers)
router.get('/all-students', auth, authorize('teacher'), async (req, res) => {
  try {
    const data = await EmotionData.find().populate('studentId', 'username email phone').sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve all student data', message: err.message });
  }
});

// Get emotion data for a specific student (For Faculty)
router.get('/student/:studentId', auth, authorize('teacher'), async (req, res) => {
  try {
    const data = await EmotionData.find({ studentId: req.params.studentId }).sort({ timestamp: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve student emotion data', message: err.message });
  }
});

module.exports = router;