const mongoose = require('mongoose');

const saleItemSchema = new mongoose.Schema({
  productType: { type: String, enum: ['cement', 'steel'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'items.productModel' },
  productModel: { type: String, enum: ['CementInventory', 'SteelInventory'], required: true },
  brand: { type: String },
  description: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, default: 'pieces' },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  gst: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true, required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items: [saleItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, default: 0, min: 0 },
  totalGst: { type: Number, default: 0, min: 0 },
  grandTotal: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, default: 0, min: 0 },
  remainingBalance: { type: Number, default: 0, min: 0 },
  paymentMode: { type: String, enum: ['cash', 'upi', 'bank_transfer', 'cheque', 'credit'], default: 'cash' },
  paymentStatus: { type: String, enum: ['paid', 'partially_paid', 'pending', 'overdue'], default: 'pending' },
  dueDate: { type: Date },
  saleDate: { type: Date, default: Date.now },
  remarks: { type: String, trim: true }
}, { timestamps: true });

saleSchema.index({ invoiceNumber: 1 });
saleSchema.index({ customer: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Sale', saleSchema);
