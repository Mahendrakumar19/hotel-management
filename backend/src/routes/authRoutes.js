const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { validationMiddleware } = require('../middleware/validation');

const router = express.Router();

// Auth routes
router.post('/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['admin', 'front_desk', 'f_and_b'])
  ],
  (req, res, next) => validationMiddleware(validationResult(req), req, res, next),
  authController.register
);

router.post('/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  (req, res, next) => validationMiddleware(validationResult(req), req, res, next),
  authController.login
);

// Get current user profile
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
