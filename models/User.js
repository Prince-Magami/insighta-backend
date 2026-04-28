const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: String,
  github_id: { type: String, unique: true },
  username: String,
  email: String,
  avatar_url: String,
  role: {
    type: String,
    enum: ["admin", "analyst"],
    default: "analyst"
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login_at: String,
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
});

module.exports = mongoose.model("User", UserSchema);
