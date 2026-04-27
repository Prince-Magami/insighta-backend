require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const connectDB = require("./db");
const Profile = require("./models/Profile");
const profileRoutes = require("./routes/profiles");

const app = express();

connectDB()
  .then(async () => {
    try {
      const count = await Profile.countDocuments();

      if (count === 0) {
        console.log("Auto-seeding database...");

        const filePath = path.join(__dirname, "data", "profiles-2026.json");
        const raw = fs.readFileSync(filePath, "utf-8");
        const json = JSON.parse(raw);

        const profiles = json.profiles || json;

        if (!Array.isArray(profiles)) {
          console.log("Invalid seed structure");
          return;
        }

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

        console.log("Auto-seeding complete:", formatted.length);
      } else {
        console.log("Database already contains data:", count);
      }
    } catch (err) {
      console.error("Auto-seed error:", err);
    }
  })
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  });

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Intelligence Query Engine running"
  });
});

app.get("/seed", async (req, res) => {
  try {
    const filePath = path.join(__dirname, "data", "profiles-2026.json");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const json = JSON.parse(rawData);

    const profiles = json.profiles || json;

    if (!Array.isArray(profiles)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid seed file structure"
      });
    }

    await Profile.deleteMany({});

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

    res.json({
      status: "success",
      message: "Database seeded successfully",
      total: formatted.length
    });

  } catch (error) {
    console.error("SEED ERROR:", error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
});

app.use("/api/profiles", profileRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
