const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['low_stock', 'payment_due', 'payment_overdue', 'new_stock', 'daily_summary', 'sale_created'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedModel: { type: String },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
