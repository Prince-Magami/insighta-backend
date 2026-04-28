const express = require("express");
const axios = require("axios");
const router = express.Router();

const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/tokens");

router.get("/github", (req, res) => {
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`;

  res.redirect(redirectUrl);
});


router.get("/github/callback", async (req, res) => {
  try {
    const code = req.query.code;

    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      {
        headers: { Accept: "application/json" }
      }
    );

    const access_token = tokenRes.data.access_token;

    const userRes = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const githubUser = userRes.data;

    let user = await User.findOne({ github_id: githubUser.id });

    if (!user) {
      const count = await User.countDocuments();

      user = await User.create({
        github_id: githubUser.id,
        username: githubUser.login,
        role: count === 0 ? "admin" : "analyst",
        is_active: true,
        last_login_at: new Date().toISOString()
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken
    });

  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Authentication failed"
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
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);

    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    return res.json({
      status: "success",
      access_token: newAccess,
      refresh_token: newRefresh
    });

  } catch (e) {
    return res.status(401).json({
      status: "error",
      message: "Invalid refresh token"
    });
  }
});


router.post("/logout", (req, res) => {
  return res.json({
    status: "success",
    message: "Logged out"
  });
});

module.exports = router;
