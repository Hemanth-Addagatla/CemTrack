const Sale = require('../models/Sale');
const Expense = require('../models/Expense');
const CementInventory = require('../models/CementInventory');
const SteelInventory = require('../models/SteelInventory');
const Customer = require('../models/Customer');

const getDateRange = (period, custom) => {
  const end = new Date(); end.setHours(23, 59, 59, 999);
  let start = new Date(); start.setHours(0, 0, 0, 0);
  if (period === 'weekly') { start.setDate(start.getDate() - 7); }
  else if (period === 'monthly') { start.setMonth(start.getMonth() - 1); }
  else if (period === 'yearly') { start.setFullYear(start.getFullYear() - 1); }
  else if (period === 'custom' && custom) {
    start = new Date(custom.startDate);
    end.setTime(new Date(custom.endDate).getTime());
  }
  return { start, end };
};

exports.getReport = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    const { start, end } = getDateRange(period, { startDate, endDate });

    const [salesData, expenseData, cementVal, steelVal, topProducts, topCustomers, pendingSales] = await Promise.all([
      Sale.aggregate([
        { $match: { saleDate: { $gte: start, $lte: end } } },
        { $group: { _id: null, revenue: { $sum: '$grandTotal' }, cost: { $sum: '$subtotal' }, count: { $sum: 1 }, totalDiscount: { $sum: '$totalDiscount' }, totalGst: { $sum: '$totalGst' } } }
      ]),
      Expense.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      CementInventory.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$currentStock', '$purchasePrice'] } } } }]),
      SteelInventory.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$currentStock', '$purchasePrice'] } } } }]),
      Sale.aggregate([
        { $match: { saleDate: { $gte: start, $lte: end } } },
        { $unwind: '$items' },
        { $group: { _id: '$items.description', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
        { $sort: { totalRevenue: -1 } }, { $limit: 10 }
      ]),
      Sale.aggregate([
        { $match: { saleDate: { $gte: start, $lte: end } } },
        { $group: { _id: '$customer', totalSpent: { $sum: '$grandTotal' }, orders: { $sum: 1 } } },
        { $sort: { totalSpent: -1 } }, { $limit: 10 },
        { $lookup: { from: 'customers', localField: '_id', foreignField: '_id', as: 'customer' } },
        { $unwind: '$customer' }
      ]),
      Sale.aggregate([
        { $match: { paymentStatus: { $in: ['pending', 'partially_paid', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$remainingBalance' } } }
      ])
    ]);

    const revenue = salesData[0]?.revenue || 0;
    const expenses = expenseData[0]?.total || 0;
    const inventoryValue = (cementVal[0]?.value || 0) + (steelVal[0]?.value || 0);

    res.status(200).json({
      success: true,
      data: {
        period, startDate: start, endDate: end,
        revenue, expenses,
        grossProfit: revenue - expenses,
        netProfit: revenue - expenses,
        salesCount: salesData[0]?.count || 0,
        inventoryValue,
        pendingPayments: pendingSales[0]?.total || 0,
        topProducts: topProducts.map(p => ({ name: p._id, quantity: p.totalQty, revenue: p.totalRevenue })),
        topCustomers: topCustomers.map(c => ({ name: c.customer.fullName, mobile: c.customer.mobile, spent: c.totalSpent, orders: c.orders }))
      }
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
