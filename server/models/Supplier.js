const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Supplier name is required'], trim: true },
  contact: { type: String, required: [true, 'Contact is required'], trim: true },
  alternateContact: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  gstNumber: { type: String, trim: true },
  supplyType: [{ type: String, enum: ['cement', 'steel'] }],
  totalOrders: { type: Number, default: 0 }
}, { timestamps: true });

supplierSchema.index({ name: 1 });
supplierSchema.index({ contact: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
