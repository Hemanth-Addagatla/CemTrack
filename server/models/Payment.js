const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  sale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
  amount: { type: Number, required: [true, 'Payment amount is required'], min: 0 },
  paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'cheque'], required: true },
  paymentDate: { type: Date, default: Date.now },
  reference: { type: String, trim: true },
  remarks: { type: String, trim: true },
  receivedBy: { type: String, trim: true }
}, { timestamps: true });

paymentSchema.index({ customer: 1 });
paymentSchema.index({ sale: 1 });
paymentSchema.index({ paymentDate: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
