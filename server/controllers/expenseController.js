const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate, sortBy = 'date', order = 'desc' } = req.query;
    const query = {};
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, data: expenses, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.addExpense = async (req, res) => {
  try {
    if (req.file) req.body.receipt = req.file.filename;
    req.body.createdBy = req.user.id;
    const expense = await Expense.create(req.body);
    res.status(201).json({ success: true, data: expense });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateExpense = async (req, res) => {
  try {
    if (req.file) req.body.receipt = req.file.filename;
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.status(200).json({ success: true, data: expense });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.date = {};
      if (startDate) match.date.$gte = new Date(startDate);
      if (endDate) match.date.$lte = new Date(endDate);
    }
    const summary = await Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]);
    const totalExpenses = summary.reduce((sum, s) => sum + s.total, 0);
    res.status(200).json({ success: true, data: summary, totalExpenses });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
