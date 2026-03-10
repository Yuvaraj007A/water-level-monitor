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
}, {
    // 🚀 SCALE OPTIMIZATION: Convert to Native MongoDB Time-Series Collection
    // This allows millions of fast IoT sensor inserts and compacts storage on-disk instantly.
    timeseries: {
        timeField: 'timestamp',
        metaField: 'tankId',
        granularity: 'seconds'
    }
});

module.exports = mongoose.model('Log', logSchema);
