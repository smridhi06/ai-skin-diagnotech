const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  qualifications: {
    degree: {
      type: String,
      required: true
    },
    medicalCouncilNumber: {
      type: String,
      required: true,
      unique: true
    },
    specialization: {
      type: String,
      default: 'Dermatology'
    },
    subSpecialties: [String],
    certifications: [String]
  },
  experience: {
    years: {
      type: Number,
      required: true,
      min: 0
    },
    previousHospitals: [{
      name: String,
      duration: String,
      role: String
    }]
  },
  currentPractice: {
    clinicName: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    consultationFee: {
      inPerson: Number,
      online: Number
    },
    timings: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      slots: [{
        start: String,
        end: String
      }]
    }]
  },
  availability: {
    inPerson: { type: Boolean, default: true },
    telemedicine: { type: Boolean, default: true },
    homeVisits: { type: Boolean, default: false }
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalConsultations: { type: Number, default: 0 },
    totalPatients: { type: Number, default: 0 },
    responseTime: { type: Number, default: 0 } // in minutes
  },
  languages: [{
    type: String,
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn', 'ml', 'pa', 'or']
  }],
  verified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['degree', 'license', 'id_proof', 'experience_certificate']
    },
    url: String,
    uploadedAt: Date
  }],
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    panNumber: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
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

// Virtual for full profile
doctorSchema.virtual('fullProfile').get(function() {
  return {
    ...this.toObject(),
    userId: this.populated('userId') || this.userId
  };
});

module.exports = mongoose.model('Doctor', doctorSchema);