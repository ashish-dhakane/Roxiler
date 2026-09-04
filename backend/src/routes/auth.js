const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { signupValidation, loginValidation, changePasswordValidation } = require('../validators/auth');

// POST /api/auth/signup - Normal user registration
router.post('/signup', signupValidation, authController.signup);

// POST /api/auth/login - Login for all roles
router.post('/login', loginValidation, authController.login);

// GET /api/auth/me - Get current user info
router.get('/me', authenticate, authController.getMe);

// POST /api/auth/change-password - Change password (authenticated)
router.post('/change-password', authenticate, changePasswordValidation, authController.changePassword);

module.exports = router;
