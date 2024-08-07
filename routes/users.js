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
      _id: req.body.id, //_id is a required field for user to be able to connect to db
      // userId: req.body.userId,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      // profileDp: req.body.profileDp,
      profilePic: req.body.profilePic,
      coverPhoto: req.body.coverPhoto,
      bio: req.body.bio,
      usersAt: req.body.usersAt,
      following: req.body.following,
      followers: req.body.followers,
      notifications: req.body.notifications,
      retweeted: req.body.retweeted,
      // links: req.body.links,
      // location: req.body.location,
    });
    // console.log(newUser);
    //Here we assign the newly created user to the user variable and save() which is a mongoose method), Then we say the res.user should come in json file
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Added retweeted Arrray to all the users at once
// User.updateMany({}, { $set: { reported: [] } })
//   .then(() => {
//     console.log("blocked array updated for all users successfully.");
//   })
//   .catch((err) => {
//     console.log("Error updating blocked array for users:", err);
//   });

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
// async function assignObjectIdsToUsers() {
//   try {
//     const users = await User.find({}); // Fetch all users

//     for (const user of users) {
//       user.usersId = new mongoose.Types.ObjectId(); // Generate a new ObjectId
//       // console.log(user.usersId);

//       await user.save(); // Save the updated user
//     }

//     console.log("ObjectIds assigned to users successfully.");
//   } catch (error) {
//     console.error("Error assigning ObjectIds to users:", error);
//   }
// }

// // Call the function to start the process
// assignObjectIdsToUsers();

//router.get
router.post("/login/", async (req, res) => {
  const userId = req.body.userId;

  let user;

  try {
    user = await User.findById(userId);
    // console.log(user);
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
router.put("/follow-user", async (req, res) => {
  const currentUser = req.body.currentUserId;

  let userToAddTo;
  let existingUser;
  let user;
  const currentUserDetails = {
    currentUserName: req.body.currentUserName,
    usersAt: req.body.currentUsersAt,
    profileDp: req.body.currentProfileDp,
    userId: req.body.currentUserId,
  };
  // console.log(currentUserDetails, "currentUserDetails");
  const userToAddToDetails = {
    name: req.body.userToAddToName,
    userAt: req.body.userToAddToAt, //This is a list of userIds. This is a list of usernames
    profilePic: req.body.userToAddToProfilePic,
    usersId: req.body.usersId,
  };
  // console.log(userToAddToDetails, "userToAddToDetails");
  try {
    userToAddTo = await User.findOneAndUpdate(
      { username: userToAddToDetails.name },
      {
        $push: { followers: currentUserDetails },
      }
    );

    await userToAddTo.save();

    //! Another way of doing the above
    // const foundUser = await User.findOne({ username: userToAddToDetails.name });
    // const pushed = foundUser.followers?.push(currentUserDetails);

    // await foundUser.save()

    existingUser = await User.findByIdAndUpdate(currentUser, {
      $push: { following: userToAddToDetails },
    });

    await existingUser.save();

    // Create a notification message
    const notificationMessage = "followed you";

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
    await user.save();
  } catch (err) {
    console.log(err);
  }

  if (!userToAddTo && !existingUser) {
    return res.status(500).json({ message: "Unable to Follow this user" });
  }
  return res.status(200).json({ user, message: "Successfully Followed" });
});

//UnFolllow a User
router.put("/unfollow-user", async (req, res) => {
  const userToBeUnfollowed = req.body.userToBeUnfollowed;
  const currentUser = req.body.currentUser;

  let userToRemoveFrom;
  let existingUser;

  try {
    //remove the current User from the person you followed
    userToRemoveFrom = await User.findOneAndUpdate(
      { username: userToBeUnfollowed },
      {
        $pull: { followers: { currentUserName: currentUser } },
      }
    );

    await userToRemoveFrom.save();

    //remove the user you followed from the existing user
    existingUser = await User.findOneAndUpdate(
      { username: currentUser },
      {
        $pull: {
          following: { name: userToBeUnfollowed },
        },
      }
    );

    await existingUser.save();
  } catch (error) {
    return res.status(500).json({ message: error });
  }

  if (!userToRemoveFrom && !existingUser) {
    return res.status(500).json({ message: "Unable to Follow" });
  }
  return res.status(200).json({ message: "Successfully Unfollowed this user" });
});

//Update user details
router.put("/:id", async (req, res) => {
  if (req.body.userId == req.params.id) {
    try {
      const updatedNote = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true } //When this line is added whatever you update shows immediately in postman
      );
      res.status(200).json(updatedNote);
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

//Route to clear notifications
router.put("/clear-notifications/clear", async (req, res) => {
  try {
    const { id } = req.body;

    if (!id || id.trim() === "") {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const user = await User.findById(id);
    // console.log(user, "this is user");

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    user.notifications = [];
    user.markModified("notifications");
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

// async function countAllUsers() {
router.get("/count", async (req, res) => {
  try {
    const user = await User.find({}).countDocuments({});
    console.log(`Total number of users: ${user}`);
    res.status(200).json({ message: `Total number of users: ${user}` });
  } catch (error) {
    console.error("Error counting users");
  }
});

//Get all a users followers
router.get("/:username/get-allfollowers", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });
    // console.log(username, "This is user");

    if (!user) {
      return res.status(404).json("User not found");
    }

    const uniqueUsernames = new Set();
    const followers = user.followers
      .filter((follower) => {
        if (
          !uniqueUsernames.has(follower.username || follower.currentUserName)
        ) {
          uniqueUsernames.add(follower.username || follower.currentUserName);
          return true;
        }
        return false;
      })
      .map((follower) => {
        return {
          id: follower.userId,
          usersAt: follower.usersAt,
          username: follower.username || follower.currentUserName,
          profileDp: follower.profileDp,
        };
      });

    // const followers = await User.find({ _id: { $in: user.followers } });
    // console.log(followers, "this are followers");

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all a users followers
router.get("/:username/all-following", async (req, res) => {
  const username = req.params.username;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const uniqueUsernames = new Set();
    const following = user.following
      .filter((following) => {
        if (!uniqueUsernames.has(following.name)) {
          uniqueUsernames.add(following.name);
          return true;
        }
        return false;
      })
      .map((following) => {
        return {
          usersId: following.usersId,
          name: following.name,
          userAt: following.userAt,
          profilePic: following.profilePic,
        };
      });
    res.status(200).json(following);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all
router.get("/:username/following-tweets", async (req, res) => {
  const username = req.params.username;
  let user;
  try {
    user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json("User not found");
    }
    //following gives me an array of all the people a user is following
    const followingNames = user.following.map((following) => following.name);

    //Now i need to find through the post and retrieve the posts each person in the following array
    // $In is a mongoDb array method that allows you break down an array into individual parts and you can then run a run something like a check for each part
    const followingPosts = await Post.find({
      username: { $in: followingNames },
    });

    // const following = user.following.map((following) => following.name);
    return res.status(200).json(followingPosts);
  } catch (error) {
    console.log(error);
  }
});

//Block a user route
router.put("/:username/block", async (req, res) => {
  //First i get the username of the user i want to block from the request params
  const username = req.params.username;

  //Then I also want a way to find the currentUser that is blocking somebody by getting the user _Id from the request body
  const { _id } = req.body;
  try {
    //Next I check the User database for the User by using the username to find the user, It of course would return the exact user object
    const user = await User.findOne({ username: username });

    //Now If the user is not found in the database return this error
    if (!user) {
      return res.status(404).json("User not found");
    }

    //Before adding the user we found to the blocked array, first we check if the user has already been added to that array previously
    const isBlocked = user.blocked?.some(
      (blocked) => blocked.username === username
    );

    //If the user is found in isBlocked i.e if isBlocked is true then return this message
    if (isBlocked) {
      return res.status(400).json("You already blocked this user");
    }

    //Then i create the user object I want to add from the user object variable
    const updatedCurrent = {
      id: user._id,
      username: user.username,
      usersAt: user.usersAt,
      usersId: user.usersId,
      profilePic: user.profilePic,
    };

    //Now Mongo methods can take at least 1 parameter or more depending on the complexity of whatever you're doing, but here, I give it what to search as an object,
    //Then the second param is also an object where you can use a $ method and then what you want it to do
    //Lastly when using the findAndUpdate method from mongoDb, i'd advise you to add the {new: true}, Cos this ensures whatever you update would be returned immediately else you might have to refresh the database first
    const currentUserUpdate = await User.findOneAndUpdate(
      { _id: _id },
      {
        $push: {
          blocked: updatedCurrent,
        },
      },
      { new: true }
    );

    // Once it had found the currentUser , I push the person i want to block to the blocked array then I save it.
    //The response here is a response of the currentUser after it has been saved
    const response = await currentUserUpdate.save();

    //I declare the variable here and assign it to the conditional statement
    let allBlockedUsernames;

    if (response) {
      allBlockedUsernames = currentUserUpdate.blocked.map(
        (user) => user.username
      );
    }

    //The response from allBlockedUsernames is an array of all the usernames in the blocked array
    //Lastly I'm basically saying, Check the Post model, inside the Post check the username and I use the Not in ($nin method) to separate things that are in that array from what i want
    const tweets = await Post.find({ username: { $nin: allBlockedUsernames } });

    return res.status(200).json({
      tweets: tweets, //FilteredTweets response
      response: response, //Updated currentUser response
      message: "User blocked successfully",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .json({ message: "An Error has occurred while trying to block user" });
  }
});

//Unblock a User
router.put("/:username/unblock", async (req, res) => {
  try {
    //Get the id of the user we want to unblock
    const { username } = req.params;

    //Get the id of the user who is unblocking
    const { _id } = req.body;

    //Find the currentUser wishing to unblock somebody
    const currentUser = await User.findById(_id);

    //Check if the user we want to unblock is in the blocked array of the currentUser
    const isBlocked = currentUser.blocked.some(
      (blocked) => blocked.username === username
    );

    //If the user is not in the blocked array then return this message
    if (!isBlocked) {
      return res.status(400).json("You haven't blocked this user");
    }

    //If the user that we want to block is in the blocked array then we want to filter out that user object by the username and whatever is left is assigned back to the currentUser blocked array
    currentUser.blocked = currentUser.blocked.filter(
      (blocked) => blocked.username !== username
    );

    //Save the updated current user
    await currentUser.save();

    return res.status(200).json({
      currentUser: currentUser,
      message: "User unblocked successfully",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .json({ message: "An Error has occurred while trying to unblock user" });
  }
});

// Search for users by their username
router.get("/search/suggested-users", async (req, res) => {
  const { usersAt } = req.query;
  try {
    const users = await User.find({
      usersAt: { $regex: new RegExp(usersAt, "i") },
    });

    // const mapped = users.map((res) => res);

    // console.log(users, "users");

    return res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
