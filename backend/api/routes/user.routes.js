const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User.model');

// @route   GET /api/v1/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phone, age, gender, skinType, language } = req.body;

    const updatedFields = {};
    if (fullName) updatedFields.fullName = fullName;
    if (phone) updatedFields.phone = phone;
    if (age) updatedFields.age = age;
    if (gender) updatedFields.gender = gender;
    if (skinType) updatedFields.skinType = skinType;
    if (language) updatedFields.language = language;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updatedFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/users/medical-history
// @desc    Update medical history
// @access  Private
router.put('/medical-history', protect, async (req, res) => {
  try {
    const { allergies, currentMedications, chronicConditions, familyHistory } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'medicalHistory.allergies': allergies || [],
          'medicalHistory.currentMedications': currentMedications || [],
          'medicalHistory.chronicConditions': chronicConditions || [],
          'medicalHistory.familyHistory': familyHistory || []
        }
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user.medicalHistory,
      message: 'Medical history updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   PUT /api/v1/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { notifications, darkMode } = req.body;

    const updateData = {};
    if (notifications) {
      if (notifications.email !== undefined) updateData['preferences.notifications.email'] = notifications.email;
      if (notifications.sms !== undefined) updateData['preferences.notifications.sms'] = notifications.sms;
      if (notifications.push !== undefined) updateData['preferences.notifications.push'] = notifications.push;
    }
    if (darkMode !== undefined) updateData['preferences.darkMode'] = darkMode;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user.preferences,
      message: 'Preferences updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
});

// @route   DELETE /api/v1/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
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