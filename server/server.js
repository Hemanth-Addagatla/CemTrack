const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CemTrack API is running', timestamp: new Date() });
});

// Auto-seed admin on first run
const User = require('./models/User');
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({ name: 'Shop Manager', email: 'admin@cemtrack.com', password: 'CemTrack@2024', role: 'admin' });
      console.log('Default admin created: admin@cemtrack.com / CemTrack@2024');
    }
  } catch (err) { /* ignore duplicate */ }
};
seedAdmin();

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`CemTrack Server running on port ${PORT}`);
});
