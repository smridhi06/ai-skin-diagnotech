const redis = require('redis');

const connectRedis = async () => {
  try {
    const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    client.on('error', (err) => console.log('Redis Client Error', err));
    console.log('✅ Redis Initialization Attempted');
  } catch (err) {
    console.log('⚠️ Redis skip');
  }
};

module.exports = { connectRedis };