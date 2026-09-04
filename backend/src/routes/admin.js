const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { createUserValidation, listUsersValidation, userIdValidation } = require('../validators/user');
const { createStoreValidation, listStoresValidation } = require('../validators/store');

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/dashboard - Dashboard statistics
router.get('/dashboard', adminController.getDashboard);
router.get('/available-owners', adminController.listAvailableOwners);
// POST /api/admin/users - Create a user (normal or admin)
router.post('/users', createUserValidation, adminController.createUser);

// POST /api/admin/stores - Create a store
router.post('/stores', createStoreValidation, adminController.createStore);

// GET /api/admin/users - List all users with filtering and sorting
router.get('/users', listUsersValidation, adminController.listUsers);

// GET /api/admin/users/:id - Get user details
router.get('/users/:id', userIdValidation, adminController.getUserDetails);

// GET /api/admin/stores - List all stores with filtering and sorting
router.get('/stores', listStoresValidation, adminController.listStores);

module.exports = router;
