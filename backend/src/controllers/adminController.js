const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const storeService = require('../services/storeService');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const stats = await userService.getDashboardStats();
      res.json({ dashboard: stats });
    } catch (err) {
      next(err);
    }
  }

  async createUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { name, email, password, address, role } = req.body;
const user = await userService.createUser(name, email, password, address, role || 'user');
      res.status(201).json({ message: 'User created successfully.', user });
    } catch (err) {
      next(err);
    }
  }
async listAvailableOwners(req, res, next) {
  try {
    const owners = await userService.listAvailableStoreOwners();
    res.json({ owners });
  } catch (err) {
    next(err);
  }
}
  async createStore(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { name, email, address, owner_id } = req.body;
      const store = await storeService.createStore(name, email, address, owner_id || null);

      res.status(201).json({ message: 'Store created successfully.', store });
    } catch (err) {
      next(err);
    }
  }

  async listUsers(req, res, next) {
    try {
      const users = await userService.listUsers({
        name: req.query.name,
        email: req.query.email,
        address: req.query.address,
        role: req.query.role,
        sort: req.query.sort,
        order: req.query.order,
      });

      res.json({ users });
    } catch (err) {
      next(err);
    }
  }

  async getUserDetails(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const user = await userService.getUserById(parseInt(req.params.id));
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async listStores(req, res, next) {
    try {
      const stores = await storeService.listStores({
        name: req.query.name,
        email: req.query.email,
        address: req.query.address,
        sort: req.query.sort,
        order: req.query.order,
      });

      res.json({ stores });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AdminController();
