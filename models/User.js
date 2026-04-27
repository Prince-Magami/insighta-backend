const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  github_id: String,
  username: String,
  role: {
    type: String,
    enum: ["admin", "analyst"],
    default: "analyst"
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  }
});

module.exports = mongoose.model("User", UserSchema);
