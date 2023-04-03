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
      unique: false,
    },
    profilePic: {
      type: String,
      required: true,
    },
    coverPhoto: {
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
    location: {
      type: String,
      required: true,
      default: "Lagos, Nigeria"
    },
    birthday: {
      type: String,
      required: false,
      default: "April, 19th, 1999"
    },
    links: {
      type: String,
      required: false,
      default: "https://mayowa-falomo.netlify.app"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
