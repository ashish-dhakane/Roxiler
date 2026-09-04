const { validationResult } = require('express-validator');
const authService = require('../services/authService');

class AuthController {
  async signup(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { name, email, password, address } = req.body;
      const result = await authService.signup(name, email, password, address);

      res.status(201).json({
        message: 'User registered successfully.',
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { email, password } = req.body;
      const result = await authService.login(email, password);

      res.json({
        message: 'Login successful.',
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map((e) => e.msg) });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res) {
    res.json({ user: req.user });
  }
}

module.exports = new AuthController();
