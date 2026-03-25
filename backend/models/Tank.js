const mongoose = require('mongoose');

const tankSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a tank name'],
        default: 'Primary Tank'
    },
    tankHeight: {
        type: Number,
        required: true,
        default: 100 // default 100 cm
    },
    tankCapacityLiters: {
        type: Number,
        required: true,
        default: 1000 // default 1000 liters
    },
    currentLevel: {
        type: Number, // percentage 0-100
        default: 0
    },
    waterVolume: {
        type: Number, // current liters
        default: 0
    },
    motorStatus: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'OFF'
    },
    automationEnabled: {
        type: Boolean,
        default: true
    },
    lowThreshold: {
        type: Number,
        default: 20 // default 20%
    },
    highThreshold: {
        type: Number,
        default: 90 // default 90%
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Tank', tankSchema);
