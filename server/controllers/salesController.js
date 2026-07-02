const Sale = require('../models/Sale');
const CementInventory = require('../models/CementInventory');
const SteelInventory = require('../models/SteelInventory');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');

const generateInvoiceNumber = async () => {
  const today = new Date();
  const prefix = `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const count = await Sale.countDocuments({ invoiceNumber: { $regex: `^${prefix}` } });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
};

exports.getSales = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, startDate, endDate, sortBy = 'saleDate', order = 'desc' } = req.query;
    const query = {};
    if (search) {
      query.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }];
    }
    if (status) query.paymentStatus = status;
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }
    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query).populate('customer', 'fullName mobile')
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, data: sales, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createSale = async (req, res) => {
  try {
    const { customer: customerId, items, amountPaid, paymentMode, dueDate, remarks } = req.body;
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals and validate stock
    let subtotal = 0, totalDiscount = 0, totalGst = 0;
    for (const item of items) {
      const Model = item.productType === 'cement' ? CementInventory : SteelInventory;
      const product = await Model.findById(item.product);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
      if (product.currentStock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.brand}. Available: ${product.currentStock}` });
      }
      item.unitPrice = item.unitPrice || product.sellingPrice;
      item.productModel = item.productType === 'cement' ? 'CementInventory' : 'SteelInventory';
      item.brand = product.brand;
      const desc = item.productType === 'cement' ? `${product.brand} ${product.cementType} ${product.grade}` : `${product.brand} ${product.diameterMM}mm ${product.quality}`;
      item.description = desc;
      item.unit = item.unit || (item.productType === 'cement' ? 'bags' : product.unit);
      const lineTotal = item.quantity * item.unitPrice;
      const disc = item.discount || 0;
      const gst = item.gst || 0;
      item.total = lineTotal - disc + gst;
      subtotal += lineTotal;
      totalDiscount += disc;
      totalGst += gst;
    }

    const grandTotal = subtotal - totalDiscount + totalGst;
    const paid = amountPaid || 0;
    const remaining = grandTotal - paid;
    let paymentStatus = 'pending';
    if (paid >= grandTotal) paymentStatus = 'paid';
    else if (paid > 0) paymentStatus = 'partially_paid';

    const sale = await Sale.create({
      invoiceNumber, customer: customerId, items,
      subtotal, totalDiscount, totalGst, grandTotal,
      amountPaid: paid, remainingBalance: remaining,
      paymentMode, paymentStatus, dueDate, saleDate: new Date(), remarks
    });

    // Decrement inventory
    for (const item of items) {
      const Model = item.productType === 'cement' ? CementInventory : SteelInventory;
      const product = await Model.findById(item.product);
      product.currentStock -= item.quantity;
      await product.save();
    }

    // Update customer totals
    await Customer.findByIdAndUpdate(customerId, {
      $inc: { totalPurchases: grandTotal, totalPaid: paid, outstandingBalance: remaining }
    });

    await Notification.create({
      type: 'sale_created', title: 'New Sale',
      message: `Invoice ${invoiceNumber} created for ₹${grandTotal.toLocaleString()}`,
      relatedModel: 'Sale', relatedId: sale._id
    });

    const populated = await Sale.findById(sale._id).populate('customer', 'fullName mobile');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('customer').lean();
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    res.status(200).json({ success: true, data: sale });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
