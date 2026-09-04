const { body, param, query } = require('express-validator');

const createUserValidation = [
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
  body('role')
  .optional()
  .isIn(['admin', 'normal', 'store_owner'])
  .withMessage('Role must be admin, normal, or store_owner.'),
];

const listUsersValidation = [
  query('name').optional().trim().isLength({ max: 60 }),
  query('email').optional().trim().isLength({ max: 255 }),
  query('address').optional().trim().isLength({ max: 400 }),
  query('role').optional().isIn(['admin', 'normal', 'store_owner']),
  query('sort').optional().isIn(['name', 'email', 'address', 'role']),
  query('order').optional().isIn(['asc', 'desc']),
];

const userIdValidation = [
  param('id').isInt({ min: 1 }).withMessage('User ID must be a positive integer.'),
];

module.exports = { createUserValidation, listUsersValidation, userIdValidation };
