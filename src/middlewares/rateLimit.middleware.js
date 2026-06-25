const rateLimitLib = require('express-rate-limit');
const { rateLimitConfig, authRateLimitConfig } = require('../config/security');

const rateLimit = rateLimitLib(rateLimitConfig);
const rateLimitAuth = rateLimitLib(authRateLimitConfig);

module.exports = { rateLimit, rateLimitAuth, authRateLimit: rateLimitAuth };
