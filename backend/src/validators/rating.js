const { body } = require('express-validator');

const submitRatingValidation = [
  body('store_id')
    .isInt({ min: 1 })
    .withMessage('Store ID must be a positive integer.'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

const updateRatingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5.'),
];

module.exports = { submitRatingValidation, updateRatingValidation };
