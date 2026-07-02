const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, markAllRead, deleteNotification } = require('../controllers/notificationController');
const auth = require('../middleware/auth');

router.get('/', auth, getNotifications);
router.put('/read-all', auth, markAllRead);
router.put('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

module.exports = router;
