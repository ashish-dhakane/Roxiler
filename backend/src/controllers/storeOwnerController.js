const storeService = require('../services/storeService');

class StoreOwnerController {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await storeService.getStoreDashboard(req.user.id);
      res.json({ dashboard });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new StoreOwnerController();
