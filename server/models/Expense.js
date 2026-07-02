const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Employee Salaries', 'Shop Rent', 'Electricity Bill', 'Water Bill', 'Transportation', 'Vehicle Fuel', 'GST Payments', 'Taxes', 'Maintenance', 'Miscellaneous']
  },
  amount: { type: Number, required: [true, 'Amount is required'], min: 0 },
  date: { type: Date, default: Date.now },
  description: { type: String, trim: true },
  receipt: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

expenseSchema.index({ category: 1 });
expenseSchema.index({ date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);
