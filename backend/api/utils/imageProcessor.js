const validateImageQuality = async (buffer) => {
  return {
    isValid: true,
    quality: "acceptable",
    issues: [],
    message: "Image accepted for analysis"
  };
};

const processImage = async (buffer) => {
  // No image resizing/compression in deployment fallback
  return buffer;
};

const getImageMetadata = async (buffer) => {
  return {
    size: buffer.length,
    format: "unknown"
  };
};

module.exports = {
  validateImageQuality,
  processImage,
  getImageMetadata
};