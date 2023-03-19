const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    usersAt: {
      type: String,
      required: true,
    },
    following: {
      type: Array,
      required: false,
    },
    followers: {
      type: Array,
      required: false,
    },
    bio: {
      type: String,
      required: false,
      default: "Regular Human",
    },
    notifications: {
      type: [],
      require: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
