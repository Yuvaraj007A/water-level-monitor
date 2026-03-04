const express = require('express');
const router = express.Router();
const { getTank, toggleMotor, updateLevelESP32, updateTankConfig } = require('../controllers/tankController');
const { protect } = require('../middleware/auth');
const { apiAuth } = require('../middleware/apiAuth');

router.get('/', protect, getTank);
router.put('/', protect, updateTankConfig);
router.post('/motor', protect, toggleMotor);

// ESP32 Endpoint
router.post('/update', apiAuth, updateLevelESP32);

module.exports = router;
