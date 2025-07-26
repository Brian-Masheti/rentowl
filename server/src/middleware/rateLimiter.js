const rateLimit = require('express-rate-limit');

// Simple rate limiter: 60 requests per 15 minutes per IP
const caretakerActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

module.exports = caretakerActionLimiter;
