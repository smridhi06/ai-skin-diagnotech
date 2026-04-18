exports.sendEmail = async (options) => {
    console.log("📧 Mock Email Sent to:", options.to);
    return true;
};