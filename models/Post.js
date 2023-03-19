const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema(
  {
    tweet: {
      type: String,
      required: false,
    },
    picture: {
      type: String,
      required: false,
    },
    video: {
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
    },
    retweet: {
      type: Array,
      required: false,
    },
    usersAt: {
      type: "String",
      required: false,
    },
    bookmarks: {
      type: "String",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", TweetSchema);
