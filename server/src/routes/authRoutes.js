const express = require('express');
const { register, login, usernameAvailable, getMe } = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  register
);
router.post('/login', login);
router.get('/username-available/:username', usernameAvailable);
router.get('/me', requireAuth, getMe);

module.exports = router;
