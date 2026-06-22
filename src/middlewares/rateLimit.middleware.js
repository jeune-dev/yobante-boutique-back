const rateLimit = require('express-rate-limit');
const { rateLimitConfig, authRateLimitConfig } = require('../config/security');

const globalLimiter = rateLimit(rateLimitConfig);
const authLimiter   = rateLimit(authRateLimitConfig);

module.exports = { globalLimiter, authLimiter };
