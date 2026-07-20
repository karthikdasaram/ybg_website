const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  try {
    // Apply only for local development if needed.
    if (process.env.NODE_ENV !== "production") {
      const currentDNS = dns.getServers();

      if (currentDNS.includes("127.0.0.1")) {
        dns.setServers(["8.8.8.8", "8.8.4.4"]);
      }
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;