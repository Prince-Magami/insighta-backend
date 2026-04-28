const jwt = require("jsonwebtoken");

const ACCESS_EXPIRY = "3m";
const REFRESH_EXPIRY = "5m";

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_EXPIRY }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: REFRESH_EXPIRY }
  );
}

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
