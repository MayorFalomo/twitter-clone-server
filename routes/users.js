const User = require("../models/Users");
const router = require("express").Router();
const Post = require("../models/Post"); 
const mongoose = require("mongoose");

//register a new user
router.post("/register", async (req, res) => {
  try {
    //Since we imported User from our User schema component here is where we expect our information to be created for new user hence for example username: request.body(A method).username and so forth
    //This is the object we're directly pushing to mongoDb, we get the request from the frontEnd
    const newUser = new User({
      userId: req.body.userId,
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
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Added retweeted Arrray to all the users at once
User.updateMany({},
  { $set: { retweeted: [] } }
)
  .then(() => {
    console.log("Retweeted array updated for all users successfully.");
  })
  .catch((err) => {
    console.log("Error updating retweeted array for users:", err);
  });

//  async function getUserIdentifiers() {
//   // Fetch user data from the database
//   const users = await User.find({});

//   // Extract usernames into an array
//   const userIdentifiers = users.map((user) => user.username);

//   return userIdentifiers;
// }

// // Call the function to retrieve the array of user identifiers
// getUserIdentifiers()
//   .then((userIdentifiers) => {
//     console.log(userIdentifiers);
//   })
//   .catch((error) => {
//     console.error(error);
//   });

//This added mongoDb ObjectId to the pre-exisiting User fields
async function assignObjectIdsToUsers() {
  try {
    const users = await User.find({}); // Fetch all users

    for (const user of users) {
      user.usersId = new mongoose.Types.ObjectId(); // Generate a new ObjectId
      // console.log(user.usersId);

      await user.save(); // Save the updated user
    }

    console.log("ObjectIds assigned to users successfully.");
  } catch (error) {
    console.error("Error assigning ObjectIds to users:", error);
  }
}

// Call the function to start the process
assignObjectIdsToUsers();

//router.get
router.get('/login/', async (req, res) => {
  const userId = req.params._id;
  
  let user;

  try {
    user = await User.findById(userId, "_id");
  } catch (error) {
    return res.status(404).json({ message: "Something went wrong." });
  }

  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  return res.status(200).json({ user });
});

// Get a single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
    //This way hides password
  } catch (err) {
    res.status(500).json(err);
  }
});

//Get a single user by username
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

//Follow a user
router.put('/follow-user', async (req, res) => {
  const userToBeFollowed = req.body.usersId;
  const currentUser = req.body.currentUserId;

  let userToAddTo;
  let existingUser;
  let user;
  const currentUserDetails = {
    username: req.body.currentUserName,
    usersAt: req.body.currentUsersAt,
    profileDp: req.body.currentProfileDp,
    userId: req.body.currentUserId,
  }
  console.log(currentUserDetails, "currentUserDetails");
  const userToAddToDetails = {
    name: req.body.userToAddToName,
    userAt: req.body.userToAddToAt, //This is a list of userIds. This is a list of usernames
    profilePic: req.body.userToAddToProfilePic,
    usersId: req.body.usersId,
  }
console.log(userToAddToDetails, "userToAddToDetails");
  try {
    userToAddTo = await User.findByIdAndUpdate(userToBeFollowed, {
    $push: {followers: currentUserDetails},
    })

    existingUser = await User.findByIdAndUpdate(currentUser, {
    $push: {following: userToAddToDetails}
    })
      // Create a notification message
    const notificationMessage = "Followed you";
    // Create a notification object with the message and userDetails
    const notification = {
      message: notificationMessage,
      ...currentUserDetails,
    };
    // console.log(notification, "notifications");
    // Find the user who was followed and push the notification object into their notifications array
    user = await User.findOneAndUpdate(
      { username: userToAddToDetails.name },
      { $push: { notifications: notification } }
    );

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
    //remove the current User from the person you followed
    userToRemoveFrom = await User.findByIdAndUpdate(userToBeUnfollowed, {
      $pull: {followers: {currentUserId: currentUser}},
    })
    //remove the user you followed from the existing user
    existingUser = await User.findByIdAndUpdate(currentUser, {
      $pull: {
        following: { usersId: userToBeUnfollowed }
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

//Get all a users notifications
router.get("/:id/get-notifications", async (req, res) => {
  const userId = req.params.id;
  //Note that id here is _id but mongodb knows that so use id not _id or it won't work.
  try {
    const user = await User.findById(userId);
    console.log(user, "This is user");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notifications = user.notifications;
    return res.status(200).json(notifications);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/clear-notifications/clear", async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id || id.trim() === '') {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await User.findById(id);
    console.log(user, "this is user");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.notifications = [];
    user.markModified('notifications');
    console.log(user.notifications);
    await user.save();
    return res.json(user.notifications);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


//Route for notifications to empty when opened
// router.put("/:id/clear-notifications", async (req, res) => {
//   // if (req.body.id && req.body.id.trim() !== '') {
//   try {
//     const user = await User.findById(req.params.id);
//     console.log(user, "this is user");

//     if (!user) {
//       return res.status(404).json({ message: "User Not Found" });
//     }

//     user.notifications = [];
//     user.markModified('notifications');
//     console.log(user.notifications);
//     await user.save();
//     return res.json(user.notifications);
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ message: "Internal Server Error" });
//   }
//   //   } else {
//   //     return res.status(400).json({ message: "Invalid userId provided" });
//   //   }
//   // }
// });


// router.put("/:username", async (req, res) => {
//   if (req.body.username == req.params.username) {
//     try {
//       const updatedUser = await User.find(
//         req.params.username,
//         { $set: req.body },
//         { new: true } //When this line is added whatever you update shows immediately in postman
//     );
//       res.status(200).json(updatedUser);
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   } else {
//     res.status(400).json({ message: "userId does not match" });
//   }
// });

//Get All Users
router.get("/", async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});




module.exports = router;
