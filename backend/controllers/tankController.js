const Tank = require('../models/Tank');
const Log = require('../models/Log');

// @desc    Get user's tank details
// @route   GET /api/tank
// @access  Private
const getTank = async (req, res) => {
    try {
        let tank = await Tank.findOne({ userId: req.user._id });

        // Auto-create a tank for the user if it doesn't exist
        if (!tank) {
            tank = await Tank.create({
                userId: req.user._id,
                tankHeight: 100,
                tankCapacityLiters: 1000,
            });
        }

        res.json(tank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update tank details (capacity/height)
// @route   PUT /api/tank
// @access  Private
const updateTankConfig = async (req, res) => {
    try {
        const { tankHeight, tankCapacityLiters, automationEnabled } = req.body;
        let tank = await Tank.findOne({ userId: req.user._id });
        if (!tank) return res.status(404).json({ message: 'Tank not found' });

        tank.tankHeight = tankHeight || tank.tankHeight;
        tank.tankCapacityLiters = tankCapacityLiters || tank.tankCapacityLiters;
        if (automationEnabled !== undefined) tank.automationEnabled = automationEnabled;

        await tank.save();
        res.json(tank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Motor manually
// @route   POST /api/tank/motor
// @access  Private
const toggleMotor = async (req, res) => {
    try {
        const { motorStatus } = req.body; // 'ON' or 'OFF'
        const tank = await Tank.findOne({ userId: req.user._id });
        if (!tank) return res.status(404).json({ message: 'Tank not found' });

        // When manual override is triggered, we might want to temporarily disable automation, 
        // but for simplicity, we just change the state.
        tank.motorStatus = motorStatus;
        await tank.save();

        // Log the manual change
        await Log.create({
            tankId: tank._id,
            level: tank.currentLevel,
            motorStatus: tank.motorStatus
        });

        res.json(tank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Receive Data from ESP32
// @route   POST /api/tank/update
// @access  Private (API Key)
const updateLevelESP32 = async (req, res) => {
    try {
        const { tankId, distance } = req.body;

        // Find the tank
        const tank = await Tank.findById(tankId);
        if (!tank) {
            return res.status(404).json({ message: 'Tank not found' });
        }

        // Calculate level percentage
        // Let's assume distance is measured from the top of the tank to the water surface.
        // Level % = ((tankHeight - distance) / tankHeight) * 100
        let levelPercent = ((tank.tankHeight - distance) / tank.tankHeight) * 100;

        // Bound the values between 0 and 100
        if (levelPercent > 100) levelPercent = 100;
        if (levelPercent < 0) levelPercent = 0;

        tank.currentLevel = Math.round(levelPercent);
        tank.waterVolume = Math.round((tank.currentLevel / 100) * tank.tankCapacityLiters);
        tank.lastUpdated = Date.now();

        // Automation Logic
        if (tank.automationEnabled) {
            if (tank.currentLevel < 20 && tank.motorStatus === 'OFF') {
                tank.motorStatus = 'ON';
            } else if (tank.currentLevel > 95 && tank.motorStatus === 'ON') {
                tank.motorStatus = 'OFF';
            }
        }

        await tank.save();

        // Log the current state
        await Log.create({
            tankId: tank._id,
            level: tank.currentLevel,
            motorStatus: tank.motorStatus
        });

        res.json({ success: true, motorStatus: tank.motorStatus, level: tank.currentLevel });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTank, toggleMotor, updateLevelESP32, updateTankConfig };
