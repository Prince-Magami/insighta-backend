const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/role");
const { Parser } = require("json2csv");

const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");
const parseNaturalQuery = require("../utils/queryParser");

const allowedSort = ["age", "created_at", "gender_probability"];
const allowedOrder = ["asc", "desc"];

const isValidNumber = (value) => {
  return value !== undefined && value !== "" && !isNaN(value);
};

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
  
  try {

    let query = {};

    if (req.query.gender) {
      query.gender = req.query.gender.toLowerCase();
    }

    if (req.query.age_group) {
      query.age_group = req.query.age_group.toLowerCase();
    }

    if (req.query.country_id) {
      query.country_id = req.query.country_id.toUpperCase();
    }

    if (req.query.min_age || req.query.max_age) {

      query.age = {};

      if (req.query.min_age !== undefined) {
        if (!isValidNumber(req.query.min_age)) {
          return res.status(422).json({
            status: "error",
            message: "Invalid query parameters"
          });
        }
        query.age.$gte = Number(req.query.min_age);
      }

      if (req.query.max_age !== undefined) {
        if (!isValidNumber(req.query.max_age)) {
          return res.status(422).json({
            status: "error",
            message: "Invalid query parameters"
          });
        }
        query.age.$lte = Number(req.query.max_age);
      }
    }

    if (req.query.min_gender_probability) {
      if (!isValidNumber(req.query.min_gender_probability)) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        });
      }

      query.gender_probability = {
        $gte: Number(req.query.min_gender_probability)
      };
    }

    if (req.query.min_country_probability) {
      if (!isValidNumber(req.query.min_country_probability)) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        });
      }

      query.country_probability = {
        $gte: Number(req.query.min_country_probability)
      };
    }


    let sort = {};

    if (req.query.sort_by) {

      if (!allowedSort.includes(req.query.sort_by)) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        });
      }

      let order = req.query.order || "asc";

      if (!allowedOrder.includes(order)) {
        return res.status(422).json({
          status: "error",
          message: "Invalid query parameters"
        });
      }

      sort[req.query.sort_by] = order === "desc" ? -1 : 1;
    }

    
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;

    const total = await Profile.countDocuments(query);

const results = await Profile.find(query)
  .sort(sort)
  .skip(skip)
  .limit(limit);

const data = results.map(p => ({
  id: p.id,
  name: p.name,
  gender: p.gender,
  gender_probability: p.gender_probability,
  age: p.age,
  age_group: p.age_group,
  country_id: p.country_id,
  country_name: p.country_name,
  country_probability: p.country_probability,
  created_at: p.created_at
}));

    return res.json({
      status: "success",
      page,
      limit,
      total,
      data
    });

  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});


router.get("/search", requireAuth, checkApiVersion, async (req, res) => {
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
  try {

    const q = req.query.q;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        status: "error",
        message: "Missing parameter"
      });
    }

    const filters = parseNaturalQuery(q);

    if (!filters || Object.keys(filters).length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Unable to interpret query"
      });
    }

    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;

    if (limit > 50) limit = 50;

    const skip = (page - 1) * limit;
const total_pages = Math.ceil(total / limit);

return res.json({
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
  data
});
module.exports = router;

    router.post("/", requireAuth, requireRole("admin"), checkApiVersion, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

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

    return res.json({
      status: "success",
      data: profile
    });

  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});

    router.get("/export", requireAuth, requireRole("admin"), checkApiVersion, async (req, res) => {
  try {

    const profiles = await Profile.find({});

    const fields = [
      "id","name","gender","gender_probability",
      "age","age_group","country_id",
      "country_name","country_probability","created_at"
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(profiles);

    res.header("Content-Type", "text/csv");
    res.attachment(`profiles_${Date.now()}.csv`);

    return res.send(csv);

  } catch (e) {
    return res.status(500).json({
      status: "error",
      message: "Server failure"
    });
  }
});
