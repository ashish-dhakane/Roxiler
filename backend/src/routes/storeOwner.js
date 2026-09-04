const express = require('express');
const router = express.Router();
const storeOwnerController = require('../controllers/storeOwnerController');
const { authenticate, authorize } = require('../middleware/auth');

// All store owner routes require authentication and store_owner role
router.use(authenticate, authorize('store_owner'));

// GET /api/store-owner/dashboard - Store owner dashboard
router.get('/dashboard', storeOwnerController.getDashboard);

module.exports = router;
