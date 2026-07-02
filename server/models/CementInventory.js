const mongoose = require('mongoose');

const cementInventorySchema = new mongoose.Schema({
  brand: { type: String, required: [true, 'Brand is required'], trim: true },
  cementType: { type: String, required: [true, 'Cement type is required'], enum: ['OPC', 'PPC', 'PSC', 'RHPC', 'LHC', 'WHC', 'Other'] },
  grade: { type: String, required: [true, 'Grade is required'], enum: ['43 Grade', '53 Grade', '33 Grade', 'Other'] },
  bags: { type: Number, required: [true, 'Number of bags is required'], min: 0 },
  currentStock: { type: Number, required: true, min: 0 },
  weightPerBag: { type: Number, default: 50 },
  purchasePrice: { type: Number, required: [true, 'Purchase price is required'], min: 0 },
  sellingPrice: { type: Number, required: [true, 'Selling price is required'], min: 0 },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
  supplierName: { type: String, trim: true },
  supplierContact: { type: String, trim: true },
  vehicleType: { type: String, trim: true },
  vehicleNumber: { type: String, trim: true },
  driverName: { type: String, trim: true },
  driverContact: { type: String, trim: true },
  invoiceNumber: { type: String, trim: true },
  dateReceived: { type: Date, default: Date.now },
  storageLocation: { type: String, trim: true },
  remarks: { type: String, trim: true },
  status: { type: String, enum: ['in-stock', 'low-stock', 'out-of-stock'], default: 'in-stock' },
  lowStockThreshold: { type: Number, default: 50 }
}, { timestamps: true });

cementInventorySchema.index({ brand: 1, grade: 1 });
cementInventorySchema.index({ status: 1 });
cementInventorySchema.index({ dateReceived: -1 });
cementInventorySchema.index({ supplierName: 1 });

cementInventorySchema.pre('save', function(next) {
  if (this.currentStock <= 0) {
    this.status = 'out-of-stock';
  } else if (this.currentStock <= this.lowStockThreshold) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('CementInventory', cementInventorySchema);
