exports.uploadToS3 = async (fileBuffer, key) => {
    console.log("Mock S3 Upload for:", key);
    return `https://mock-s3-bucket.s3.amazonaws.com/${key}`;
};
exports.deleteFromS3 = async (key) => {
    console.log("Mock S3 Delete for:", key);
    return true;
};