const { body, query } = require('express-validator');

const createStoreValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 60 })
    .withMessage('Store name is required and must not exceed 60 characters.'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address.'),
  body('address')
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address is required and must not exceed 400 characters.'),
  body('owner_id')
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage('Owner ID must be a positive integer if provided.'),
];

const searchStoresValidation = [
  query('search').optional().trim().isLength({ max: 255 }),
  query('sort').optional().isIn(['name', 'email', 'address', 'rating']),
  query('order').optional().isIn(['asc', 'desc']),
];

const listStoresValidation = [
  query('name').optional().trim().isLength({ max: 60 }),
  query('email').optional().trim().isLength({ max: 255 }),
  query('address').optional().trim().isLength({ max: 400 }),
  query('sort').optional().isIn(['name', 'email', 'address', 'rating']),
  query('order').optional().isIn(['asc', 'desc']),
];

module.exports = { createStoreValidation, searchStoresValidation, listStoresValidation };
