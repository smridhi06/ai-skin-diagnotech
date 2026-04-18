const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['primary', 'closeup', 'wide', 'side'],
      default: 'primary'
    },
    s3Key: String,
    metadata: {
      width: Number,
      height: Number,
      format: String,
      size: Number
    }
  }],
  aiAnalysis: {
    primaryCondition: {
      name: String,
      confidence: Number,
      icd10Code: String
    },
    alternativeConditions: [{
      name: String,
      confidence: Number,
      icd10Code: String
    }],
    modelVersions: {
      resnet: String,
      efficientnet: String,
      custom: String
    },
    processingTime: Number, // in milliseconds
    features: {
      color: [String],
      texture: String,
      size: String,
      shape: String,
      distribution: String
    }
  },
  symptoms: {
    duration: {
      type: String,
      enum: ['less_than_week', '1-2_weeks', '2-4_weeks', 'over_month', 'several_months']
    },
    spreading: {
      type: String,
      enum: ['yes_rapidly', 'yes_slowly', 'no_change', 'getting_smaller']
    },
    painLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    itching: {
      type: String,
      enum: ['none', 'mild', 'moderate', 'severe']
    },
    bleeding: Boolean,
    discharge: Boolean,
    fever: Boolean,
    swelling: Boolean,
    additionalSymptoms: [String]
  },
  urgencyLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  recommendations: {
    seekProfessionalCare: {
      type: Boolean,
      default: true
    },
    urgency: {
      type: String,
      enum: ['routine', 'within_week', 'within_2_weeks', 'urgent', 'emergency']
    },
    homeCareTips: [String],
    avoidances: [String]
  },
  doctorReview: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    diagnosis: String,
    notes: String,
    prescriptionId: String
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'doctor_reviewed', 'resolved'],
    default: 'pending'
  },
  location: {
    bodyPart: {
      type: String,
      enum: ['face', 'scalp', 'neck', 'chest', 'back', 'arms', 'hands', 'legs', 'feet', 'other']
    },
    specificArea: String
  },
  followUp: {
    required: Boolean,
    scheduledDate: Date,
    previousScanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Scan'
    }
  },
  userFeedback: {
    helpful: Boolean,
    accuracyRating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    actualDiagnosis: String
  },
  metadata: {
    deviceInfo: {
      platform: String,
      version: String,
      model: String
    },
    appVersion: String,
    language: String,
    ipAddress: String
  },
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

// Indexes for better query performance
scanSchema.index({ userId: 1, createdAt: -1 });
scanSchema.index({ 'aiAnalysis.primaryCondition.name': 1 });
scanSchema.index({ urgencyLevel: 1, status: 1 });
scanSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Scan', scanSchema);