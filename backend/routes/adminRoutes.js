const express = require('express');
const router = express.Router();
const { getAllUsersData, getSystemStats, deleteUser } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// Protected/Admin routes
router.get('/users', protect, admin, getAllUsersData);
router.get('/stats', protect, admin, getSystemStats);
router.delete('/user/:id', protect, admin, deleteUser);

module.exports = router;
