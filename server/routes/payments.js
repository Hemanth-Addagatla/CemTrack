const express = require('express');
const router = express.Router();
const { getPayments, recordPayment, getPending, getReminders } = require('../controllers/paymentController');
const auth = require('../middleware/auth');

router.get('/', auth, getPayments);
router.post('/', auth, recordPayment);
router.get('/pending', auth, getPending);
router.get('/reminders', auth, getReminders);

module.exports = router;
