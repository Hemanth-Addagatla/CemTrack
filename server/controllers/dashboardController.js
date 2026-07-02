const Sale = require('../models/Sale');
const CementInventory = require('../models/CementInventory');
const SteelInventory = require('../models/SteelInventory');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');

exports.getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Inventory stats
    const cementStock = await CementInventory.aggregate([
      { $group: { _id: null, totalBags: { $sum: '$currentStock' }, totalValue: { $sum: { $multiply: ['$currentStock', '$sellingPrice'] } } } }
    ]);
    const steelStock = await SteelInventory.aggregate([
      { $group: { _id: null, totalQty: { $sum: '$currentStock' }, totalValue: { $sum: { $multiply: ['$currentStock', '$sellingPrice'] } } } }
    ]);

    // Sales stats
    const todaySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: today, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
    ]);
    const monthlySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: '$grandTotal' } } }
    ]);

    // Payment stats
    const pendingPayments = await Sale.aggregate([
      { $match: { paymentStatus: { $in: ['pending', 'partially_paid', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$remainingBalance' }, count: { $sum: 1 } } }
    ]);

    // Customer count
    const totalCustomers = await Customer.countDocuments();

    // Low stock
    const lowStockCement = await CementInventory.countDocuments({ status: 'low-stock' });
    const lowStockSteel = await SteelInventory.countDocuments({ status: 'low-stock' });

    // Today's expenses
    const todayExpenses = await Expense.aggregate([
      { $match: { date: { $gte: today, $lte: endOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const cementValue = cementStock[0]?.totalValue || 0;
    const steelValue = steelStock[0]?.totalValue || 0;
    const monthlyRev = monthlySales[0]?.revenue || 0;
    const monthlyExp = monthlyExpenses[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalInventoryValue: cementValue + steelValue,
        totalCementBags: cementStock[0]?.totalBags || 0,
        totalSteelStock: steelStock[0]?.totalQty || 0,
        todaySales: todaySales[0]?.total || 0,
        todaySalesCount: todaySales[0]?.count || 0,
        monthlyRevenue: monthlyRev,
        pendingPayments: pendingPayments[0]?.total || 0,
        pendingPaymentsCount: pendingPayments[0]?.count || 0,
        totalCustomers,
        lowStockAlerts: lowStockCement + lowStockSteel,
        todayExpenses: todayExpenses[0]?.total || 0,
        monthlyProfit: monthlyRev - monthlyExp
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Daily sales (last 30 days)
    const dailySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } }, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', total: 1, count: 1, _id: 0 } }
    ]);

    // Monthly sales (last 12 months)
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const monthlySales = await Sale.aggregate([
      { $match: { saleDate: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$saleDate' } }, total: { $sum: '$grandTotal' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', total: 1, count: 1, _id: 0 } }
    ]);

    // Monthly expenses
    const monthlyExpenses = await Expense.aggregate([
      { $match: { date: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $project: { month: '$_id', total: 1, _id: 0 } }
    ]);

    // Payment collection (last 30 days)
    const paymentCollection = await Payment.aggregate([
      { $match: { paymentDate: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', total: 1, _id: 0 } }
    ]);

    // Recent sales
    const recentSales = await Sale.find()
      .populate('customer', 'fullName mobile')
      .sort({ saleDate: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: { dailySales, monthlySales, monthlyExpenses, paymentCollection, recentSales }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
