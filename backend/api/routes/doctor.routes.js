const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/doctors
// @desc    Get all verified doctors
// @access  Public
router.get('/', async (req, res) => {
  try {
    const Doctor = require('../models/Doctor.model');
    const { page = 1, limit = 10, city, specialization, telemedicine } = req.query;

    const query = { verified: true, status: 'approved' };
    if (city) query['currentPractice.address.city'] = new RegExp(city, 'i');
    if (specialization) query['qualifications.specialization'] = new RegExp(specialization, 'i');
    if (telemedicine === 'true') query['availability.telemedicine'] = true;

    const doctors = await Doctor.find(query)
      .populate('userId', 'fullName email phone profilePicture')
      .sort({ 'ratings.average': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Doctor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: doctors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalDoctors: count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   GET /api/v1/doctors/:id
// @desc    Get doctor by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const Doctor = require('../models/Doctor.model');
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'fullName email phone profilePicture');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/v1/doctors/register
// @desc    Register as doctor
// @access  Private
router.post('/register', protect, async (req, res) => {
  try {
    const Doctor = require('../models/Doctor.model');
    const User = require('../models/User.model');

    // Check if already registered as doctor
    const existing = await Doctor.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already registered as doctor'
      });
    }

    const {
      degree,
      medicalCouncilNumber,
      specialization,
      yearsExperience,
      clinicName,
      address,
      consultationFee,
      languages
    } = req.body;

    const doctor = await Doctor.create({
      userId: req.user.id,
      qualifications: {
        degree,
        medicalCouncilNumber,
        specialization: specialization || 'Dermatology'
      },
      experience: {
        years: yearsExperience
      },
      currentPractice: {
        clinicName,
        address,
        consultationFee: {
          inPerson: consultationFee?.inPerson || 500,
          online: consultationFee?.online || 300
        }
      },
      languages: languages || ['en', 'hi'],
      status: 'pending'
    });

    // Update user role
    await User.findByIdAndUpdate(req.user.id, { role: 'doctor' });

    res.status(201).json({
      success: true,
      data: doctor,
      message: 'Doctor registration submitted. Pending verification.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/doctors/availability
// @desc    Update doctor availability
// @access  Private (Doctor only)
router.put('/availability', protect, authorize('doctor'), async (req, res) => {
  try {
    const Doctor = require('../models/Doctor.model');
    const { inPerson, telemedicine, homeVisits } = req.body;

    const doctor = await Doctor.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          'availability.inPerson': inPerson,
          'availability.telemedicine': telemedicine,
          'availability.homeVisits': homeVisits
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: doctor.availability,
      message: 'Availability updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   POST /api/v1/doctors/:id/review
// @desc    Rate a doctor
// @access  Private
router.post('/:id/review', protect, async (req, res) => {
  try {
    const Doctor = require('../models/Doctor.model');
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update average rating
    const newCount = doctor.ratings.count + 1;
    const newAverage = ((doctor.ratings.average * doctor.ratings.count) + rating) / newCount;

    doctor.ratings.average = Math.round(newAverage * 10) / 10;
    doctor.ratings.count = newCount;
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor.ratings,
      message: 'Review submitted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

module.exports = router;