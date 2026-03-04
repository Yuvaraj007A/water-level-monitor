const Log = require('../models/Log');
const Tank = require('../models/Tank');
// Native JS dates used.

// Helper to get tank by user
const getUserTankId = async (userId) => {
    const tank = await Tank.findOne({ userId });
    return tank ? tank._id : null;
};

// @desc    Get daily analytics
// @route   GET /api/analytics/daily
// @access  Private
const getDailyAnalytics = async (req, res) => {
    try {
        const tankId = await getUserTankId(req.user._id);
        if (!tankId) return res.status(404).json({ message: 'Tank not found' });

        // Last 24 hours logs
        const start = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const logs = await Log.find({ tankId, timestamp: { $gte: start } }).sort({ timestamp: 1 });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get weekly analytics
// @route   GET /api/analytics/weekly
// @access  Private
const getWeeklyAnalytics = async (req, res) => {
    try {
        const tankId = await getUserTankId(req.user._id);
        if (!tankId) return res.status(404).json({ message: 'Tank not found' });

        // Grouping by day for the last 7 days
        const start = new Date(new Date().setDate(new Date().getDate() - 7));

        // Aggregation pipeline to get average water level per day and motor ON count
        const stats = await Log.aggregate([
            { $match: { tankId, timestamp: { $gte: start } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    averageLevel: { $avg: "$level" },
                    logsCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get monthly analytics
// @route   GET /api/analytics/monthly
// @access  Private
const getMonthlyAnalytics = async (req, res) => {
    try {
        const tankId = await getUserTankId(req.user._id);
        if (!tankId) return res.status(404).json({ message: 'Tank not found' });

        // Last 30 days
        const start = new Date(new Date().setDate(new Date().getDate() - 30));

        // Aggregation pipeline to get average daily levels for 30 days
        const stats = await Log.aggregate([
            { $match: { tankId, timestamp: { $gte: start } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    averageLevel: { $avg: "$level" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDailyAnalytics, getWeeklyAnalytics, getMonthlyAnalytics };
