const express = require('express');
const router = express.Router();
const { getSales, createSale, getSale } = require('../controllers/salesController');
const auth = require('../middleware/auth');

router.get('/', auth, getSales);
router.post('/', auth, createSale);
router.get('/:id', auth, getSale);

module.exports = router;
