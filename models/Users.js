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
      default: "April, 19th, 2023"
    },
    links: {
      type: String,
      required: false,
      default: "https://mayowa-falomo.netlify.app"
    }
  },
  { timestamps: true }
);

// UserSchema.pre(["updateOne", "findOneAndUpdate", "findByIdAndUpdate", "updateMany" ], async function (next) {
//     if(this.get("username")){
//          let userDoc = await mongoose.model("user").findOne(this._conditions);
//          await mongoose.model("post").updateOne({ username: userDoc.username },{
//          username: this.get("username")
//          });
//     }
//     next();
//   })

module.exports = mongoose.model("User", UserSchema);
