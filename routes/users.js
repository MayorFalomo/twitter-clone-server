const User = require("../models/Users");
const router = require("express").Router();
const Post = require("../models/Post");

//register a new user
router.post("/register", async (req, res) => {
  try {
    //Since we imported User from our User schema component here is where we expect our information to be created for new user hence for example username: request.body(A method).username and so forth
    //This is the object we're directly pushing to mongoDb, we get the request from the frontEnd
    const newUser = new User({
      _id: req.body.userId,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profilePic: req.body.profilePic,
      coverPhoto: req.body.coverPhoto,
      bio: req.body.bio,
      usersAt: req.body.usersAt,
      following: req.body.following,
      followers: req.body.followers,
      notifications: req.body.notifications,
    });
    //Here we assign the newly created user to the user variable and save() which is a mongoose method), Then we say the res.user should come in json file
    const user = await newUser.save();
    console.log(user);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
     const { password, ...others } = user._doc;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get(`/get-user/:username`, async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.find({ username });
    res.status(200).json(user);
    console.log(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get single user
// router.get("/:id", async (req, res) => {
//   const userId = req.params.id;

//   let user;
//   try {
//     user = await User.findById(userId, "_id");
//   } catch (err) {
//     return res.status(404).json({ message: "Something went Wrong" });
//   }
//   if (!user) {
//     return res.status(404).json({ message: "user not found" });
//   }
//   return res.status(200).json({ user });
// });

//Update user details
router.put("/:id", async (req, res) => {
  if (req.body.userId == req.params.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true } //When this line is added whatever you update shows immediately in postman
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(400).json({ message: "userId does not match" });
  }
});

//Get All Users
router.get("/", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Follow a user
router.put('/follow-user', async (req, res) => {
  const userToBeFollowed = req.body.userToAddToUserId;
  const currentUser = req.body.userId;

  let userToAddTo;
  let existingUser;

  const currentUserDetails = {
    username: req.body.currentUserName,
    profilePic: req.body.currentUserProfilePic,
    userId: req.body.userId,
  }

  const userToAddToDetails = {
    username: req.body.userToAddToName,
    profilePic: req.body.userToAddToProfilePic,
    userId: req.body.userId,
  }

  try {
    userToAddTo = User.findByIdAndUpdate(userToBeFollowed, {
      $push: {followers: currentUserDetails},
    })

    existingUser = await User.findByIdAndUpdate(currentUser, {
      $push: {following: userToAddToDetails}
    })
  } catch (err) { console.log(err) }
  
  if (!userToAddTo && !existingUser) {
    return res.status(500).json({message: "Unable to Follow this user"})
  }
  return res.status(200).json({message: "Successfully Followed"})
  
})

//UnFolllow a User
router.put('/unfollow-user', async (req, res) => { 
  const userToBeUnfollowed = req.body.userToBeUnfollowed;
  const currentUser = req.body.currentUser;

  let userToRemoveFrom;
  let existingUser;

  try {
    userToRemoveFrom = await User.findByIdAndUpdate(userToBeUnfollowed, {
      $pull: {followers: {userId: currentUser}},
    })
    existingUser = await User.findByIdAndUpdate(currentUser, {
      $pull: {
        following: { userToAddToUserId: userToBeUnfollowed }
      },
    })
  } catch (error) {
    return res.status(500).json({message: error})
  }

  if (!userToRemoveFrom && !existingUser) {
    return res.status(500).json({message: "Unable to Follow"})
  }
  return res.status(200).json({message: "Successfully Unfollowed this user"})
})


module.exports = router;
