const mongoose = require('mongoose');

const steelInventorySchema = new mongoose.Schema({
  brand: { type: String, required: [true, 'Brand is required'], trim: true },
  rodType: { type: String, required: [true, 'Rod type is required'], enum: ['TMT Bar', 'CTD Bar', 'Mild Steel Rod', 'Wire Rod', 'Other'] },
  quality: { type: String, required: [true, 'Quality grade is required'], enum: ['Fe415', 'Fe500', 'Fe500D', 'Fe550', 'Fe550D', 'Fe600', 'Other'] },
  radiusMM: { type: Number, min: 0 },
  diameterMM: { type: Number, required: [true, 'Diameter is required'], enum: [6, 8, 10, 12, 16, 20, 25, 32, 40] },
  lengthFt: { type: Number, default: 40 },
  lengthMeter: { type: Number, default: 12 },
  surfaceFinish: { type: String, enum: ['Ribbed', 'Plain', 'Indented'], default: 'Ribbed' },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: 0 },
  currentStock: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['pieces', 'kg', 'ton', 'bundle', 'quintal'], default: 'pieces' },
  weightPerUnit: { type: Number, min: 0 },
  totalWeight: { type: Number, min: 0 },
  bundleCount: { type: Number, min: 0 },
  piecesPerBundle: { type: Number, min: 0 },
  purchasePrice: { type: Number, required: [true, 'Purchase price is required'], min: 0 },
  sellingPrice: { type: Number, required: [true, 'Selling price is required'], min: 0 },
  pricePerKg: { type: Number, min: 0 },
  pricePerTon: { type: Number, min: 0 },
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
  lowStockThreshold: { type: Number, default: 20 }
}, { timestamps: true });

steelInventorySchema.index({ brand: 1, diameterMM: 1 });
steelInventorySchema.index({ quality: 1 });
steelInventorySchema.index({ rodType: 1 });
steelInventorySchema.index({ status: 1 });
steelInventorySchema.index({ dateReceived: -1 });

steelInventorySchema.pre('save', function(next) {
  if (this.radiusMM && !this.diameterMM) {
    this.diameterMM = this.radiusMM * 2;
  }
  if (this.diameterMM && !this.radiusMM) {
    this.radiusMM = this.diameterMM / 2;
  }
  if (this.currentStock <= 0) {
    this.status = 'out-of-stock';
  } else if (this.currentStock <= this.lowStockThreshold) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('SteelInventory', steelInventorySchema);
