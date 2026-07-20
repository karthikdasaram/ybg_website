require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@gym.com').toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
  } else {
    await User.create({
      name: process.env.ADMIN_NAME || 'Gym Admin',
      email,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'admin'
    });
    console.log('Admin account created:');
    console.log(`  Email:    ${email}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('Please log in and change this password.');
  }

  await mongoose.connection.close();
  process.exit(0);
};

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
