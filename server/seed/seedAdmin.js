const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    const admin = await User.create({
      name: 'Shop Manager',
      email: 'admin@cemtrack.com',
      password: 'CemTrack@2024',
      role: 'admin'
    });

    console.log('Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: CemTrack@2024');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error.message);
    process.exit(1);
  }
};

seedAdmin();
