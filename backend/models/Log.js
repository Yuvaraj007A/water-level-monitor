const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    tankId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tank',
        required: true
    },
    level: {
        type: Number,
        required: true
    },
    motorStatus: {
        type: String,
        enum: ['ON', 'OFF'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Optimized index for fast analytics querying
logSchema.index({ tankId: 1, timestamp: -1 });

module.exports = mongoose.model('Log', logSchema);
