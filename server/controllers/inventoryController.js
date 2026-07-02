const CementInventory = require('../models/CementInventory');
const SteelInventory = require('../models/SteelInventory');
const Notification = require('../models/Notification');

// =============== CEMENT ===============
exports.getCement = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, brand, grade, status, sortBy = 'dateReceived', order = 'desc' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (grade) query.grade = grade;
    if (status) query.status = status;

    const total = await CementInventory.countDocuments(query);
    const cement = await CementInventory.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: cement,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addCement = async (req, res) => {
  try {
    req.body.currentStock = req.body.bags;
    const cement = await CementInventory.create(req.body);

    // Check low stock and create notification
    if (cement.status === 'low-stock') {
      await Notification.create({
        type: 'low_stock',
        title: 'Low Cement Stock',
        message: `${cement.brand} ${cement.grade} stock is low (${cement.currentStock} bags remaining)`,
        relatedModel: 'CementInventory',
        relatedId: cement._id
      });
    }

    await Notification.create({
      type: 'new_stock',
      title: 'New Cement Stock Added',
      message: `${cement.bags} bags of ${cement.brand} ${cement.grade} added`,
      relatedModel: 'CementInventory',
      relatedId: cement._id
    });

    res.status(201).json({ success: true, data: cement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCement = async (req, res) => {
  try {
    const cement = await CementInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cement) return res.status(404).json({ success: false, message: 'Cement stock not found' });
    res.status(200).json({ success: true, data: cement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCement = async (req, res) => {
  try {
    const cement = await CementInventory.findByIdAndDelete(req.params.id);
    if (!cement) return res.status(404).json({ success: false, message: 'Cement stock not found' });
    res.status(200).json({ success: true, message: 'Cement stock deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============== STEEL ===============
exports.getSteel = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, brand, diameterMM, quality, rodType, status, sortBy = 'dateReceived', order = 'desc' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { brand: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { vehicleNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (diameterMM) query.diameterMM = parseInt(diameterMM);
    if (quality) query.quality = quality;
    if (rodType) query.rodType = rodType;
    if (status) query.status = status;

    const total = await SteelInventory.countDocuments(query);
    const steel = await SteelInventory.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      data: steel,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addSteel = async (req, res) => {
  try {
    req.body.currentStock = req.body.quantity;
    const steel = await SteelInventory.create(req.body);

    if (steel.status === 'low-stock') {
      await Notification.create({
        type: 'low_stock',
        title: 'Low Steel Stock',
        message: `${steel.brand} ${steel.diameterMM}mm ${steel.quality} stock is low (${steel.currentStock} ${steel.unit} remaining)`,
        relatedModel: 'SteelInventory',
        relatedId: steel._id
      });
    }

    await Notification.create({
      type: 'new_stock',
      title: 'New Steel Stock Added',
      message: `${steel.quantity} ${steel.unit} of ${steel.brand} ${steel.diameterMM}mm ${steel.quality} added`,
      relatedModel: 'SteelInventory',
      relatedId: steel._id
    });

    res.status(201).json({ success: true, data: steel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSteel = async (req, res) => {
  try {
    const steel = await SteelInventory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!steel) return res.status(404).json({ success: false, message: 'Steel stock not found' });
    res.status(200).json({ success: true, data: steel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSteel = async (req, res) => {
  try {
    const steel = await SteelInventory.findByIdAndDelete(req.params.id);
    if (!steel) return res.status(404).json({ success: false, message: 'Steel stock not found' });
    res.status(200).json({ success: true, message: 'Steel stock deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============== SHARED ===============
exports.getLowStock = async (req, res) => {
  try {
    const lowCement = await CementInventory.find({ status: { $in: ['low-stock', 'out-of-stock'] } }).lean();
    const lowSteel = await SteelInventory.find({ status: { $in: ['low-stock', 'out-of-stock'] } }).lean();
    res.status(200).json({
      success: true,
      data: {
        cement: lowCement.map(c => ({ ...c, productType: 'cement' })),
        steel: lowSteel.map(s => ({ ...s, productType: 'steel' })),
        total: lowCement.length + lowSteel.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
