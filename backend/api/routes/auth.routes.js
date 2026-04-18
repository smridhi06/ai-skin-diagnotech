const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Validation middleware
const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Valid Indian phone number required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('age').isInt({ min: 1, max: 120 }).withMessage('Valid age required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// @route   POST /api/v1/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', registerValidation, authController.register);

// @route   POST /api/v1/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, authController.login);

// @route   POST /api/v1/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', authController.googleAuth);

// @route   POST /api/v1/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/v1/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post('/reset-password/:token', authController.resetPassword);

// @route   GET /api/v1/auth/verify-email/:token
// @desc    Verify email
// @access  Public
router.get('/verify-email/:token', authController.verifyEmail);

// @route   POST /api/v1/auth/resend-verification
// @desc    Resend verification email
// @access  Private
router.post('/resend-verification', protect, authController.resendVerification);

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, authController.getCurrentUser);

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, authController.logout);

module.exports = router;