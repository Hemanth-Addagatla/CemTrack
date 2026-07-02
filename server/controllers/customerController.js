const Customer = require('../models/Customer');
const Sale = require('../models/Sale');

exports.getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { village: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }
    if (city) query.city = { $regex: city, $options: 'i' };
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, data: customers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json({ success: true, data: customer });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).lean();
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const purchases = await Sale.find({ customer: req.params.id }).sort({ saleDate: -1 }).lean();
    res.status(200).json({ success: true, data: { ...customer, purchases } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, data: customer });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.status(200).json({ success: true, message: 'Customer deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
