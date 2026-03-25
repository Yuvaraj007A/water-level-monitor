const User = require('../models/User');
const Tank = require('../models/Tank');

// @desc    Get all users with their tanks
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsersData = async (req, res) => {
    try {
        const users = await User.find({ role: 'User' }).select('-password');
        const userData = await Promise.all(users.map(async (user) => {
            const tanks = await Tank.find({ userId: user._id });
            return {
                ...user.toObject(),
                tanks
            };
        }));
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'User' });
        const totalTanks = await Tank.countDocuments();
        const activeMotors = await Tank.countDocuments({ motorStatus: 'ON' });
        
        res.json({
            totalUsers,
            totalTanks,
            activeMotors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user and their tanks
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await Tank.deleteMany({ userId: user._id });
        await user.deleteOne();

        res.json({ message: 'User and associated tanks removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllUsersData,
    getSystemStats,
    deleteUser
};
