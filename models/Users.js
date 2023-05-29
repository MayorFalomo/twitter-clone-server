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
      required: false,
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
    retweeted: {
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
      default: "April, 19th, 2023"
    },
    links: {
      type: String,
      required: false,
      default: "https://mayowa-falomo.netlify.app"
    },
    usersId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  try {
    // Find all posts associated with this user
    const posts = await mongoose.model('Post').find({ user: this.usersId });

    // Update the profileDp field in each post
    for (const post of posts) {
      post.profileDp = this.usersId;
      await post.save();
    }
    next();
  } catch (error) {
    next(error);
  }
});

UserSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "user",
  justOne: false,
  justOne: false,
  // options: { populate: { path: "profileDp" } }
});

module.exports = mongoose.model("User", UserSchema);
