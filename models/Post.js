const mongoose = require("mongoose");

const TweetSchema = new mongoose.Schema(
  {
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
        required: true,
        unique: true,
      },
      retweet: {
        type: Array,
        required: true,
      },
      reply: {
        type: Array,
        required: true,
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
    // newId: {
    //   type: String,
    //   required: false,
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  //     user: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: false,
  // },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Post", TweetSchema);
