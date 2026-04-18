const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/v1/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const Scan = require('../models/Scan.model');

    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const todayScans = await Scan.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });
    const highRiskScans = await Scan.countDocuments({ urgencyLevel: 'high' });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalScans,
        todayScans,
        highRiskScans
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

// @route   GET /api/v1/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const { page = 1, limit = 10 } = req.query;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalUsers: count
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

// @route   GET /api/v1/admin/scans
// @desc    Get all scans
// @access  Private (Admin only)
router.get('/scans', protect, authorize('admin'), async (req, res) => {
  try {
    const Scan = require('../models/Scan.model');
    const { page = 1, limit = 10, urgency, status } = req.query;

    const query = {};
    if (urgency) query.urgencyLevel = urgency;
    if (status) query.status = status;

    const scans = await Scan.find(query)
      .populate('userId', 'fullName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Scan.countDocuments(query);

    res.status(200).json({
      success: true,
      data: scans,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalScans: count
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

// @route   DELETE /api/v1/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
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