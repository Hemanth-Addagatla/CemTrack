const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, 'Full name is required'], trim: true },
  mobile: { type: String, required: [true, 'Mobile number is required'], unique: true, trim: true },
  alternateMobile: { type: String, trim: true },
  address: { type: String, trim: true,required: [true, 'Address is required'] },
  village: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  pinCode: { type: String, trim: true },
  referredBy: { type: String, trim: true },
  constructorName: { type: String, trim: true },
  constructorMobile: { type: String, trim: true },
  totalPurchases: { type: Number, default: 0,required: [true, 'Total purchases is required'] },
  totalPaid: { type: Number, default: 0 ,required: [true, 'Total paid is required'] },
  outstandingBalance: { type: Number, default: 0 }
}, { timestamps: true });

customerSchema.index({ fullName: 'text' });
customerSchema.index({ mobile: 1 });
customerSchema.index({ city: 1 });
customerSchema.index({ village: 1 });

module.exports = mongoose.model('Customer', customerSchema);
