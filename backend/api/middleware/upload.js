const multer = require('multer');
const sharp = require('sharp');
const AWS = require('aws-sdk');
const path = require('path');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

// Multer memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.'), false);
  }
};

// Multer upload configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Upload to S3 middleware
exports.uploadToS3 = upload;

// Process and upload helper
exports.processAndUpload = async (fileBuffer, filename) => {
  // Process image with sharp
  const processedImage = await sharp(fileBuffer)
    .resize(1024, 1024, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Upload to S3
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: filename,
    Body: processedImage,
    ContentType: 'image/jpeg',
    ACL: 'private',
    ServerSideEncryption: 'AES256'
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

// Generate signed URL for secure access
exports.getSignedUrl = (s3Key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key,
    Expires: 3600 // URL valid for 1 hour
  };

  return s3.getSignedUrl('getObject', params);
};

// Delete from S3
exports.deleteFromS3 = async (s3Key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: s3Key
  };

  await s3.deleteObject(params).promise();
};