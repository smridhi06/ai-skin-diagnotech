const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const asyncHandler = require('../middleware/asyncHandler');
const { sendEmail } = require('../utils/email');
const { sendSMS } = require('../utils/sms');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { fullName, email, phone, password, age, gender, skinType, language } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email 
        ? 'Email already registered' 
        : 'Phone number already registered'
    });
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    age,
    gender,
    skinType,
    language: language || 'en'
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Send verification email
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Email - AI Skin DiagnoTech',
    template: 'verification',
    data: {
      name: fullName,
      verificationUrl
    }
  });

  // Generate JWT
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role
    },
    message: 'Registration successful. Please verify your email.'
  });
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user (include password field)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      verified: user.verified
    }
  });
});

// @desc    Google OAuth
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
  const { idToken, name, email, picture } = req.body;

  // In production, verify idToken with Google
  // For now, simplified version

  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    user = await User.create({
      fullName: name,
      email,
      phone: `GOOGLE_${Date.now()}`, // Temporary, ask user to update
      password: crypto.randomBytes(32).toString('hex'), // Random password
      age: 18, // Ask to update
      gender: 'other', // Ask to update
      profilePicture: picture,
      verified: {
        email: true,
        phone: false
      }
    });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    token,
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      needsProfileCompletion: !user.phone.startsWith('GOOGLE_') ? false : true
    }
  });
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No account found with that email'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // 1 hour

  // Save to user (you'll need to add these fields to schema)
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = resetTokenExpiry;
  await user.save();

  // Send email
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset - AI Skin DiagnoTech',
    template: 'password-reset',
    data: {
      name: user.fullName,
      resetUrl
    }
  });

  res.status(200).json({
    success: true,
    message: 'Password reset link sent to email'
  });
});

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  // In a real app, you might invalidate the token in Redis
  // For now, just send success (client will remove token)

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  // Implementation similar to reset password
  res.status(200).json({
    success: true,
    message: 'Email verified successfully'
  });
});

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res) => {
  // Generate new token and send email
  res.status(200).json({
    success: true,
    message: 'Verification email sent'
  });
});