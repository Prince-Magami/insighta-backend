const express = require("express");
const router = express.Router();

const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken
} = require("../utils/token");

// ✅ LOGIN (TEMP – replace with GitHub later)
router.post("/login", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Username required"
      });
    }

    let user = await User.findOne({ username });

    if (!user) {
      user = await User.create({
        id: Date.now().toString(),
        username,
        role: "admin" 
      });
    }

    const access_token = generateAccessToken(user);
    const refresh_token = generateRefreshToken(user);

    user.refresh_token = refresh_token;
    user.last_login_at = new Date();
    await user.save();

    res.json({
      status: "success",
      access_token,
      refresh_token
    });

  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

router.post("/refresh", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        status: "error",
        message: "Missing refresh token"
      });
    }

    const decoded = require("jsonwebtoken").verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findOne({
      id: decoded.id,
      refresh_token
    });

    if (!user) {
      return res.status(403).json({
        status: "error",
        message: "Invalid refresh token"
      });
    }

    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    user.refresh_token = newRefresh;
    await user.save();

    res.json({
      status: "success",
      access_token: newAccess,
      refresh_token: newRefresh
    });

  } catch {
    res.status(403).json({
      status: "error",
      message: "Refresh failed"
    });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const user = await User.findOne({ refresh_token });

    if (user) {
      user.refresh_token = null;
      await user.save();
    }

    res.json({
      status: "success",
      message: "Logged out"
    });

  } catch {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

module.exports = router;
