const storeService = require('../services/storeService');
const ratingService = require('../services/ratingService');
const { validationResult } = require('express-validator');

class StoreController {
  async searchStores(req, res, next) {
    try {
      const { search, sort, order } = req.query;
      const stores = await storeService.searchStores(search, sort, order, req.user.id);
      res.json({ stores });
    } catch (err) {
      next(err);
    }
  }

  async submitRating(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { store_id, rating } = req.body;
      const result = await ratingService.submitRating(req.user.id, store_id, rating);

      const message = result.updated
        ? 'Rating updated successfully.'
        : 'Rating submitted successfully.';

      res.status(result.updated ? 200 : 201).json({ message, rating: result });
    } catch (err) {
      next(err);
    }
  }

  async updateRating(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const storeId = parseInt(req.params.storeId);
      const { rating } = req.body;

      const result = await ratingService.updateRating(req.user.id, storeId, rating);
      res.json({ message: 'Rating updated successfully.', rating: result });
    } catch (err) {
      next(err);
    }
  }

  async getMyRating(req, res, next) {
    try {
      const storeId = parseInt(req.params.storeId);
      const rating = await ratingService.getUserRatingForStore(req.user.id, storeId);
      res.json({ rating });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StoreController();
