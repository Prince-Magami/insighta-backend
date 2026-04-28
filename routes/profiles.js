const express = require("express");
const router = express.Router();

const Profile = require("../models/Profile");
const parseNaturalQuery = require("../utils/queryParser");

const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");

const { Parser } = require("json2csv");

const checkApiVersion = (req, res, next) => {
  const version = req.headers["x-api-version"];

  if (!version) {
    return res.status(400).json({
      status: "error",
      message: "API version header required"
    });
  }

  if (version !== "1") {
    return res.status(400).json({
      status: "error",
      message: "Invalid API version"
    });
  }

  next();
};

router.get("/", requireAuth, checkApiVersion, async (req, res) => {
  try {
    let query = {};

    if (req.query.gender) query.gender = req.query.gender.toLowerCase();
    if (req.query.age_group) query.age_group = req.query.age_group.toLowerCase();
    if (req.query.country_id) query.country_id = req.query.country_id.toUpperCase();

    if (req.query.min_age || req.query.max_age) {
      query.age = {};
      if (req.query.min_age) query.age.$gte = Number(req.query.min_age);
      if (req.query.max_age) query.age.$lte = Number(req.query.max_age);
    }

    let sort = {};
    if (req.query.sort_by) {
      sort[req.query.sort_by] = req.query.order === "desc" ? -1 : 1;
    }

    let page = parseInt(req.query.page) || 1;
    let limit = Math.min(parseInt(req.query.limit) || 10, 50);
    let skip = (page - 1) * limit;

    const total = await Profile.countDocuments(query);

    const results = await Profile.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total_pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      page,
      limit,
      total,
      total_pages,
      links: {
        self: `/api/v1/profiles?page=${page}&limit=${limit}`,
        next: page < total_pages ? `/api/v1/profiles?page=${page + 1}&limit=${limit}` : null,
        prev: page > 1 ? `/api/v1/profiles?page=${page - 1}&limit=${limit}` : null
      },
      data: results
    });

  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

router.get("/search", requireAuth, checkApiVersion, async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Missing query"
      });
    }

    const filters = parseNaturalQuery(q);

    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const total = await Profile.countDocuments(filters);

    const results = await Profile.find(filters)
      .skip(skip)
      .limit(limit);

    const total_pages = Math.ceil(total / limit);

    res.json({
      status: "success",
      page,
      limit,
      total,
      total_pages,
      links: {
        self: `/api/v1/profiles/search?q=${q}`,
        next: page < total_pages ? `/api/v1/profiles/search?q=${q}&page=${page + 1}` : null,
        prev: page > 1 ? `/api/v1/profiles/search?q=${q}&page=${page - 1}` : null
      },
      data: results
    });

  } catch (e) {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

router.post("/", requireAuth, requireRole("admin"), checkApiVersion, async (req, res) => {
  try {
    const { name } = req.body;

    const profile = await Profile.create({
      id: Date.now().toString(),
      name,
      gender: "female",
      gender_probability: 0.9,
      age: 30,
      age_group: "adult",
      country_id: "US",
      country_name: "United States",
      country_probability: 0.8,
      created_at: new Date().toISOString()
    });

    res.json({
      status: "success",
      data: profile
    });

  } catch {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

router.get("/export", requireAuth, requireRole("admin"), checkApiVersion, async (req, res) => {
  try {
    const profiles = await Profile.find();

    const parser = new Parser();
    const csv = parser.parse(profiles);

    res.header("Content-Type", "text/csv");
    res.attachment(`profiles_${Date.now()}.csv`);
    res.send(csv);

  } catch {
    res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

module.exports = router;
