const Payment = require('../models/Payment');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');

exports.getPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, startDate, endDate } = req.query;
    const query = {};
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('customer', 'fullName mobile')
      .populate('sale', 'invoiceNumber grandTotal')
      .sort({ paymentDate: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, data: payments, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.recordPayment = async (req, res) => {
  try {
    const { sale: saleId, amount, paymentMode, reference, remarks } = req.body;
    const sale = await Sale.findById(saleId);
    if (!sale) return res.status(404).json({ success: false, message: 'Sale not found' });
    if (amount > sale.remainingBalance) {
      return res.status(400).json({ success: false, message: `Amount exceeds remaining balance of ₹${sale.remainingBalance}` });
    }

    const payment = await Payment.create({
      customer: sale.customer, sale: saleId,
      amount, paymentMode, reference, remarks, receivedBy: req.user?.name || 'Manager'
    });

    sale.amountPaid += amount;
    sale.remainingBalance -= amount;
    sale.paymentStatus = sale.remainingBalance <= 0 ? 'paid' : 'partially_paid';
    await sale.save();

    await Customer.findByIdAndUpdate(sale.customer, {
      $inc: { totalPaid: amount, outstandingBalance: -amount }
    });

    const populated = await Payment.findById(payment._id)
      .populate('customer', 'fullName mobile')
      .populate('sale', 'invoiceNumber grandTotal');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getPending = async (req, res) => {
  try {
    const sales = await Sale.find({ paymentStatus: { $in: ['pending', 'partially_paid', 'overdue'] } })
      .populate('customer', 'fullName mobile').sort({ dueDate: 1 }).lean();
    const totalOutstanding = sales.reduce((sum, s) => sum + s.remainingBalance, 0);
    res.status(200).json({ success: true, data: sales, totalOutstanding });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getReminders = async (req, res) => {
  try {
    const sales = await Sale.find({
      paymentStatus: { $in: ['pending', 'partially_paid', 'overdue'] },
      remainingBalance: { $gt: 0 }
    }).populate('customer', 'fullName mobile alternateMobile').sort({ dueDate: 1 }).lean();

    const reminders = sales.map(sale => {
      const daysRemaining = sale.dueDate ? Math.ceil((new Date(sale.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
      return {
        _id: sale._id, invoiceNumber: sale.invoiceNumber,
        customerName: sale.customer?.fullName, phone: sale.customer?.mobile,
        amountDue: sale.remainingBalance, dueDate: sale.dueDate,
        daysRemaining, paymentStatus: sale.paymentStatus, customerId: sale.customer?._id
      };
    });
    res.status(200).json({ success: true, data: reminders });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
