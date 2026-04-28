require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const connectDB = require("./db");
const Profile = require("./models/Profile");

const profileRoutes = require("./routes/profiles");
const authRoutes = require("./routes/auth");

const app = express();

connectDB()
  .then(async () => {
    const count = await Profile.countDocuments();

    if (count === 0) {
      console.log("Auto-seeding database...");

      const filePath = path.join(__dirname, "data", "profiles-2026.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      const json = JSON.parse(raw);

      const profiles = json.profiles || json;

      const formatted = profiles.map((p, i) => ({
        id: `${Date.now()}-${i}`,
        name: p.name,
        gender: p.gender,
        gender_probability: p.gender_probability,
        age: p.age,
        age_group: p.age_group,
        country_id: p.country_id,
        country_name: p.country_name,
        country_probability: p.country_probability,
        created_at: new Date().toISOString()
      }));

      await Profile.insertMany(formatted);
      console.log("Seeded:", formatted.length);
    } else {
      console.log("Database already contains:", count);
    }
  })
  .catch((err) => {
    console.error("DB ERROR:", err.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60
});

app.use("/api/v1/auth", authLimiter);
app.use("/api/v1", apiLimiter);

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Insighta Labs+ API running"
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/profiles", profileRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

module.exports = (req, res, next) => {
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
