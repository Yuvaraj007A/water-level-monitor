const Tank = require('../models/Tank');
const Log = require('../models/Log');
const mqttClient = require('../config/mqtt');

// @desc    Get user's all tanks details
// @route   GET /api/tank
// @access  Private
const getTanks = async (req, res) => {
    try {
        let tanks = await Tank.find({ userId: req.user._id });

        // Auto-create a primary tank for the user if they have 0 tanks
        if (tanks.length === 0) {
            const primaryTank = await Tank.create({
                userId: req.user._id,
                name: 'Primary Tank',
                tankHeight: 100,
                tankCapacityLiters: 1000,
                lowThreshold: 20,
                highThreshold: 90
            });
            tanks = [primaryTank];
        }

        res.json(tanks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new tank
// @route   POST /api/tank
// @access  Private
const createTank = async (req, res) => {
    try {
        const { name, tankHeight, tankCapacityLiters, lowThreshold, highThreshold } = req.body;
        const tank = await Tank.create({
            userId: req.user._id,
            name: name || 'Secondary Tank',
            tankHeight: tankHeight || 100,
            tankCapacityLiters: tankCapacityLiters || 1000,
            lowThreshold: lowThreshold || 20,
            highThreshold: highThreshold || 90,
        });
        res.status(201).json(tank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update tank details (capacity/height/name)
// @route   PUT /api/tank/:id
// @access  Private
const updateTankConfig = async (req, res) => {
    try {
        const { name, tankHeight, tankCapacityLiters, automationEnabled, lowThreshold, highThreshold } = req.body;
        let tank = await Tank.findOne({ _id: req.params.id, userId: req.user._id });
        if (!tank) return res.status(404).json({ message: 'Tank not found' });

        if (name) tank.name = name;
        if (tankHeight) tank.tankHeight = Number(tankHeight) || 100;
        if (tankCapacityLiters) tank.tankCapacityLiters = Number(tankCapacityLiters) || 1000;
        if (automationEnabled !== undefined) tank.automationEnabled = automationEnabled;
        if (lowThreshold !== undefined) tank.lowThreshold = Number(lowThreshold) || 20;
        if (highThreshold !== undefined) tank.highThreshold = Number(highThreshold) || 90;

        await tank.save();

        // Publish configuration update to MQTT so the Relay node gets latest thresholds
        const configPayload = {
            lowThreshold: tank.lowThreshold,
            highThreshold: tank.highThreshold,
            tankHeight: tank.tankHeight,
            automationEnabled: tank.automationEnabled
        };
        mqttClient.publish(`watermonitor/tank/${tank._id}/config`, JSON.stringify(configPayload), { retain: true });

        res.json(tank);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle Motor manually
// @route   POST /api/tank/motor/:id
// @access  Private
const toggleMotor = async (req, res) => {
    try {
        const { motorStatus } = req.body; // 'ON' or 'OFF'
        const tank = await Tank.findOne({ _id: req.params.id, userId: req.user._id });
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

        // Publish to MQTT to let ESP32 know instantly
        mqttClient.publish(`watermonitor/tank/${tank._id}/motor`, tank.motorStatus);

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

        // Automation Logic using custom thresholds
        if (tank.automationEnabled) {
            const low = tank.lowThreshold || 20;
            const high = tank.highThreshold || 95;

            if (tank.currentLevel < low && tank.motorStatus === 'OFF') {
                tank.motorStatus = 'ON';
            } else if (tank.currentLevel > high && tank.motorStatus === 'ON') {
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

module.exports = { getTanks, createTank, toggleMotor, updateLevelESP32, updateTankConfig };
