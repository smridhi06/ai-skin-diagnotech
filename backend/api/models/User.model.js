const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please provide valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
    select: false
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  skinType: {
    type: String,
    enum: ['I', 'II', 'III', 'IV', 'V', 'VI'], // Fitzpatrick scale
    default: 'IV'
  },
  language: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
  },
  role: {
    type: String,
    enum: ['user', 'doctor', 'admin'],
    default: 'user'
  },
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    validUntil: Date,
    razorpaySubscriptionId: String
  },
  medicalHistory: {
    allergies: [String],
    currentMedications: [String],
    chronicConditions: [String],
    familyHistory: [String]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    darkMode: { type: Boolean, default: false }
  },
  profilePicture: {
    type: String,
    default: 'default-avatar.png'
  },
  verified: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false }
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);