const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { submitRatingValidation, updateRatingValidation } = require('../validators/rating');
const { searchStoresValidation } = require('../validators/store');

// All store routes require authentication and normal user role
router.use(authenticate, authorize('normal'));

// GET /api/stores - Search/list stores for normal user
router.get('/', searchStoresValidation, storeController.searchStores);

// POST /api/stores/rate - Submit a rating
router.post('/rate', submitRatingValidation, storeController.submitRating);

// PUT /api/stores/:storeId/rate - Update a rating
router.put('/:storeId/rate', updateRatingValidation, storeController.updateRating);

// GET /api/stores/:storeId/my-rating - Get user's rating for a store
router.get('/:storeId/my-rating', storeController.getMyRating);

module.exports = router;
