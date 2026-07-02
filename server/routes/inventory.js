const express = require('express');
const router = express.Router();
const { getCement, addCement, updateCement, deleteCement, getSteel, addSteel, updateSteel, deleteSteel, getLowStock } = require('../controllers/inventoryController');
const auth = require('../middleware/auth');

router.get('/cement', auth, getCement);
router.post('/cement', auth, addCement);
router.put('/cement/:id', auth, updateCement);
router.delete('/cement/:id', auth, deleteCement);
router.get('/steel', auth, getSteel);
router.post('/steel', auth, addSteel);
router.put('/steel/:id', auth, updateSteel);
router.delete('/steel/:id', auth, deleteSteel);
router.get('/low-stock', auth, getLowStock);

module.exports = router;
