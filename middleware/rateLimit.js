const rateLimit = require("express-rate-limit");

exports.authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

exports.apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    status: "error",
    message: "Too many requests"
  }
});
