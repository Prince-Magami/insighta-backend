const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || !user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden"
      });
    }

    req.user = user;
    next();

  } catch (e) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token"
    });
  }
};

module.exports = { requireAuth };
