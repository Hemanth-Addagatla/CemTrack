const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense, getSummary } = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', auth, getExpenses);
router.post('/', auth, upload.single('receipt'), addExpense);
router.put('/:id', auth, upload.single('receipt'), updateExpense);
router.delete('/:id', auth, deleteExpense);
router.get('/summary', auth, getSummary);

module.exports = router;
