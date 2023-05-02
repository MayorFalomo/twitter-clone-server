const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  profileDp: {
    type: String,
    required: true,
  },
//   location: {
//     type: String,
//     required: true,
//   },
  username: {
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
  tweet: {
    type: String,
    required: true,
  },
  postId: {
    type: String,
    required: true,
  },
  saved: {
    type: Boolean,
    required: true,
    },
    likes: {
        type: [],
        required: true,
    },
    comments: {
        type: [],
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
  },
    userDetail: {
    type: String,
    // type: mongoose.Types.ObjectId,
    // ref: "Users",
    required: true,
  },
});

module.exports = mongoose.model("bookmarks", BookmarkSchema);