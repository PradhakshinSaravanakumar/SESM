const mongoose = require('mongoose');

const emotionDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  emotion: {
    type: String,
    default: 'Self-Reported', // Made optional for manual entry
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  confidence: {
    type: Number,
    default: 1.0,
  },
  gameScore: {
    type: Number,
    default: 0,
  },
  mood: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  stress: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  anxiety: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  alertStatus: {
    type: String,
    enum: ['none', 'new', 'acknowledged', 'resolved'],
    default: 'none'
  }
});

module.exports = mongoose.model('EmotionData', emotionDataSchema);