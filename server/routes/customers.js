const express = require('express');
const router = express.Router();
const { getCustomers, addCustomer, getCustomer, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const auth = require('../middleware/auth');

router.get('/', auth, getCustomers);
router.post('/', auth, addCustomer);
router.get('/:id', auth, getCustomer);
router.put('/:id', auth, updateCustomer);
router.delete('/:id', auth, deleteCustomer);

module.exports = router;
