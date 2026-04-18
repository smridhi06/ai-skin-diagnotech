const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadToS3 } = require('../middleware/upload');
const scanController = require('../controllers/scan.controller');

// @route   POST /api/v1/scans
// @desc    Create new scan
// @access  Private
router.post('/', protect, uploadToS3.array('images', 5), scanController.createScan);

// @route   GET /api/v1/scans
// @desc    Get user's scans
// @access  Private
router.get('/', protect, scanController.getUserScans);

// @route   GET /api/v1/scans/:id
// @desc    Get scan by ID
// @access  Private
router.get('/:id', protect, scanController.getScanById);

// @route   PUT /api/v1/scans/:id/symptoms
// @desc    Update scan symptoms
// @access  Private
router.put('/:id/symptoms', protect, scanController.updateSymptoms);

// @route   POST /api/v1/scans/:id/analyze
// @desc    Trigger AI analysis
// @access  Private
router.post('/:id/analyze', protect, scanController.analyzeImage);

// @route   PUT /api/v1/scans/:id/feedback
// @desc    Submit user feedback
// @access  Private
router.put('/:id/feedback', protect, scanController.submitFeedback);

// @route   DELETE /api/v1/scans/:id
// @desc    Delete scan
// @access  Private
router.delete('/:id', protect, scanController.deleteScan);

// @route   GET /api/v1/scans/stats/overview
// @desc    Get user scan statistics
// @access  Private
router.get('/stats/overview', protect, scanController.getUserStats);

module.exports = router;