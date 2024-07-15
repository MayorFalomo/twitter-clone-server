const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      // default: mongoose.Types.ObjectId,
      // type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    tweet: {
      type: String,
      required: false,
    },
    profileDp: {
      type: String,
      // default: "https://i.pinimg.com/564x/33/f4/d8/33f4d8c6de4d69b21652512cbc30bb05.jpg",
      // ref: "User",
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
      like: {
        type: Array,
        // required: true,
        required: false,
      },
      retweet: {
        type: Array,
        required: false,
      },
      reply: {
        type: Array,
        required: false,
      },
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
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: false,

    //   // required: true,
    // },
    followingTweets: {
      type: Array,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", TweetSchema);
