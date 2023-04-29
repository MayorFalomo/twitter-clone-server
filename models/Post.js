const mongoose = require("mongoose");
const { db } = require("./Users");

const TweetSchema = new mongoose.Schema(
  {
    // _id: {
    //   type: String,
    //   required: true,
    // },
    username: {
      type: String,
      required: true,
      unique: false,
    },
    tweet: {
      type: String,
      required: false,
    },
    profileDp: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },
    video: {
      type: String,
      required: false,
    },
    gif: {
    type: String,
      required: false,
    },
    likes: {
      type: Array,
      required: false,
    },
    comments: {
      type: Array,
      required: false,
      like: {
        type: Array,
        required: false,
      },
      retweet: {
        type: Array,
        required: false,
      },
      comments: {
        type: Array,
        required: false,
      }
    },
    retweet: {
      type: Array,
      required: false,
    },
    quoted: {
      type: Array,
      required: false,
    },
    usersAt: {
      type: String,
      required: false,
    },
    bookmarks: {
      type: Array,
      required: false,
    },
    // time: {
    //   type: Date,
    //   required: true,
    //   default: Date.now()
    // },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Post", TweetSchema);
