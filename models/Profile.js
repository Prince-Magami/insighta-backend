const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema({
  id: String,
  name: String,
  gender: String,
  gender_probability: Number,
  age: Number,
  age_group: String,
  country_id: String,
  country_name: String,
  country_probability: Number,
  created_at: String
});

module.exports = mongoose.model("Profile", ProfileSchema);
