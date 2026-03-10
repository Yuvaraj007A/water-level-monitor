const mongoose = require('mongoose');
const dns = require('dns');

// Explicitly set DNS servers to avoid SRV lookup issues
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // 🚀 SCALE OPTIMIZATION: Connection Pooling
      // Increase the maximum number of connections (default is 100) to handle
      // parallel database operations smoothly when 1000s of MQTT messages arrive.
      maxPoolSize: 500,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;