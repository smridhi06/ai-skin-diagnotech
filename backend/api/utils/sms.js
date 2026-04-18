exports.sendSMS = async (options) => {
    console.log("📱 Mock SMS Sent to:", options.to);
    return true;
};