const { body } = require('express-validator');

const signupValidation = [
  body('name')
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/)
    .withMessage('Password must contain at least one special character.'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters.'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required.'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('New password must be between 8 and 16 characters.')
    .matches(/[A-Z]/)
    .withMessage('New password must contain at least one uppercase letter.')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/)
    .withMessage('New password must contain at least one special character.'),
];

module.exports = { signupValidation, loginValidation, changePasswordValidation };
