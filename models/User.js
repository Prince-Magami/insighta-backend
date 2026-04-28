const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true }, 
  github_id: { type: String, unique: true, sparse: true },
  username: { type: String, required: true },
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

  refresh_token: String, 

  last_login_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", UserSchema);
