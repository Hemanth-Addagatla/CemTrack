const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, unreadOnly } = req.query;
    const query = {};
    if (type) query.type = type;
    if (unreadOnly === 'true') query.isRead = false;
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ isRead: false });
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit)).lean();
    res.status(200).json({ success: true, data: notifications, unreadCount, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: notification });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};
