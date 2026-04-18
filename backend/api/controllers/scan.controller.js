const Scan = require('../models/Scan.model');
const User = require('../models/User.model');
const axios = require('axios');
const { processImage } = require('../utils/imageProcessor');
const { uploadToS3, deleteFromS3 } = require('../utils/s3');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Create new scan
// @route   POST /api/v1/scans
// @access  Private
exports.createScan = asyncHandler(async (req, res) => {
  const { bodyPart, specificArea, language } = req.body;
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Please upload at least one image'
    });
  }

  // Process and upload images
  const processedImages = await Promise.all(
    req.files.map(async (file, index) => {
      // Process image (resize, compress, etc.)
      const processed = await processImage(file.buffer);
      
      // Upload to S3
      const s3Key = `scans/${req.user.id}/${Date.now()}-${index}.jpg`;
      const s3Url = await uploadToS3(processed, s3Key);

      return {
        url: s3Url,
        s3Key: s3Key,
        type: index === 0 ? 'primary' : 'closeup',
        metadata: {
          width: processed.width,
          height: processed.height,
          format: 'jpeg',
          size: processed.size
        }
      };
    })
  );

  // Create scan record
  const scan = await Scan.create({
    userId: req.user.id,
    images: processedImages,
    location: {
      bodyPart,
      specificArea
    },
    status: 'pending',
    metadata: {
      language: language || 'en',
      appVersion: req.headers['app-version'],
      deviceInfo: {
        platform: req.headers['platform'],
        version: req.headers['platform-version']
      }
    }
  });

  res.status(201).json({
    success: true,
    data: scan,
    message: 'Scan created successfully. Ready for analysis.'
  });
});

// @desc    Analyze scan with AI
// @route   POST /api/v1/scans/:id/analyze
// @access  Private
exports.analyzeImage = asyncHandler(async (req, res) => {
  const scan = await Scan.findById(req.params.id);

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: 'Scan not found'
    });
  }

  // Check ownership
  if (scan.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this scan'
    });
  }

  // Call ML service
  const startTime = Date.now();
  
  try {
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/predict`,
      {
        image_url: scan.images[0].url,
        symptoms: scan.symptoms || {}
      },
      {
        timeout: 30000 // 30 second timeout
      }
    );

    const processingTime = Date.now() - startTime;
    const predictions = mlResponse.data;

    // Update scan with AI results
    scan.aiAnalysis = {
      primaryCondition: {
        name: predictions.primary.name,
        confidence: predictions.primary.confidence,
        icd10Code: predictions.primary.icd10_code
      },
      alternativeConditions: predictions.alternatives.map(alt => ({
        name: alt.name,
        confidence: alt.confidence,
        icd10Code: alt.icd10_code
      })),
      modelVersions: predictions.model_versions,
      processingTime: processingTime,
      features: predictions.features
    };

    // Determine urgency level
    scan.urgencyLevel = determineUrgency(predictions, scan.symptoms);

    // Generate recommendations
    scan.recommendations = generateRecommendations(
      predictions.primary.name,
      scan.urgencyLevel,
      scan.symptoms
    );

    scan.status = 'analyzed';
    await scan.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${req.user.id}`).emit('scan-analyzed', {
      scanId: scan._id,
      results: scan.aiAnalysis
    });

    res.status(200).json({
      success: true,
      data: scan,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('ML Service Error:', error.message);
    
    // Fallback: mark for manual review
    scan.status = 'pending_manual_review';
    scan.metadata.mlError = error.message;
    await scan.save();

    return res.status(500).json({
      success: false,
      message: 'Analysis failed. Your scan has been queued for manual review.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update scan symptoms
// @route   PUT /api/v1/scans/:id/symptoms
// @access  Private
exports.updateSymptoms = asyncHandler(async (req, res) => {
  const scan = await Scan.findById(req.params.id);

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: 'Scan not found'
    });
  }

  // Check ownership
  if (scan.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this scan'
    });
  }

  const { duration, spreading, painLevel, itching, bleeding, discharge, fever, swelling, additionalSymptoms } = req.body;

  scan.symptoms = {
    duration,
    spreading,
    painLevel,
    itching,
    bleeding,
    discharge,
    fever,
    swelling,
    additionalSymptoms: additionalSymptoms || []
  };

  await scan.save();

  res.status(200).json({
    success: true,
    data: scan,
    message: 'Symptoms updated successfully'
  });
});

// @desc    Get user's scans
// @route   GET /api/v1/scans
// @access  Private
exports.getUserScans = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, urgency } = req.query;

  const query = { userId: req.user.id };
  
  if (status) query.status = status;
  if (urgency) query.urgencyLevel = urgency;

  const scans = await Scan.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-metadata -__v');

  const count = await Scan.countDocuments(query);

  res.status(200).json({
    success: true,
    data: scans,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalScans: count,
      scansPerPage: parseInt(limit)
    }
  });
});

// @desc    Get scan by ID
// @route   GET /api/v1/scans/:id
// @access  Private
exports.getScanById = asyncHandler(async (req, res) => {
  const scan = await Scan.findById(req.params.id)
    .populate('userId', 'fullName email phone')
    .populate('doctorReview.reviewedBy', 'fullName qualifications.specialization');

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: 'Scan not found'
    });
  }

  // Check ownership or doctor access
  if (scan.userId._id.toString() !== req.user.id && req.user.role !== 'doctor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to access this scan'
    });
  }

  res.status(200).json({
    success: true,
    data: scan
  });
});

// @desc    Submit user feedback
// @route   PUT /api/v1/scans/:id/feedback
// @access  Private
exports.submitFeedback = asyncHandler(async (req, res) => {
  const { helpful, accuracyRating, comments, actualDiagnosis } = req.body;

  const scan = await Scan.findById(req.params.id);

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: 'Scan not found'
    });
  }

  if (scan.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  scan.userFeedback = {
    helpful,
    accuracyRating,
    comments,
    actualDiagnosis
  };

  await scan.save();

  res.status(200).json({
    success: true,
    message: 'Thank you for your feedback!'
  });
});

// @desc    Delete scan
// @route   DELETE /api/v1/scans/:id
// @access  Private
exports.deleteScan = asyncHandler(async (req, res) => {
  const scan = await Scan.findById(req.params.id);

  if (!scan) {
    return res.status(404).json({
      success: false,
      message: 'Scan not found'
    });
  }

  if (scan.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized'
    });
  }

  // Delete images from S3
  await Promise.all(
    scan.images.map(img => deleteFromS3(img.s3Key))
  );

  await scan.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Scan deleted successfully'
  });
});

// @desc    Get user statistics
// @route   GET /api/v1/scans/stats/overview
// @access  Private
exports.getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const stats = await Scan.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        avgConfidence: { $avg: '$aiAnalysis.primaryCondition.confidence' },
        urgencyCounts: {
          $push: '$urgencyLevel'
        }
      }
    }
  ]);

  const conditionBreakdown = await Scan.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$aiAnalysis.primaryCondition.name',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalScans: stats[0]?.totalScans || 0,
      avgConfidence: stats[0]?.avgConfidence || 0,
      topConditions: conditionBreakdown,
      urgencyBreakdown: {
        low: stats[0]?.urgencyCounts.filter(u => u === 'low').length || 0,
        medium: stats[0]?.urgencyCounts.filter(u => u === 'medium').length || 0,
        high: stats[0]?.urgencyCounts.filter(u => u === 'high').length || 0
      }
    }
  });
});

// Helper functions
function determineUrgency(predictions, symptoms) {
  const highRiskConditions = ['melanoma', 'basal cell carcinoma', 'squamous cell carcinoma', 'severe infection'];
  
  // Check if primary condition is high risk
  if (highRiskConditions.some(condition => 
    predictions.primary.name.toLowerCase().includes(condition.toLowerCase())
  )) {
    return 'high';
  }

  // Check symptoms
  if (symptoms?.fever || symptoms?.bleeding || symptoms?.painLevel >= 8) {
    return 'high';
  }

  if (symptoms?.spreading === 'yes_rapidly' || symptoms?.painLevel >= 5) {
    return 'medium';
  }

  return 'low';
}

function generateRecommendations(condition, urgency, symptoms) {
  const recommendations = {
    seekProfessionalCare: true,
    urgency: 'routine',
    homeCareTips: [],
    avoidances: []
  };

  if (urgency === 'high') {
    recommendations.urgency = 'urgent';
    recommendations.homeCareTips.push('Seek immediate medical attention');
  } else if (urgency === 'medium') {
    recommendations.urgency = 'within_week';
  } else {
    recommendations.urgency = 'within_2_weeks';
  }

  // Condition-specific tips (simplified)
  const commonTips = {
    acne: ['Keep area clean', 'Avoid touching or picking', 'Use oil-free products'],
    eczema: ['Moisturize regularly', 'Avoid irritants', 'Use gentle soaps'],
    psoriasis: ['Keep skin moisturized', 'Avoid triggers', 'Gentle skin care']
  };

  const conditionKey = condition.toLowerCase();
  for (let key in commonTips) {
    if (conditionKey.includes(key)) {
      recommendations.homeCareTips = commonTips[key];
      break;
    }
  }

  recommendations.avoidances = [
    'Do not self-medicate without consultation',
    'Avoid harsh chemicals',
    'Do not scratch or pick at affected area'
  ];

  return recommendations;
}
