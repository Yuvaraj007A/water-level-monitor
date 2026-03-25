const express = require('express');
const router = express.Router();
const { getTanks, createTank, toggleMotor, updateLevelESP32, updateTankConfig } = require('../controllers/tankController');
const { protect } = require('../middleware/auth');
const { apiAuth } = require('../middleware/apiAuth');

router.get('/', protect, getTanks);
router.post('/', protect, createTank);
router.put('/:id', protect, updateTankConfig);
router.post('/motor/:id', protect, toggleMotor);

// ESP32 Endpoint
router.post('/update', apiAuth, updateLevelESP32);

module.exports = router;
