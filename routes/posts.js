const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/Users");

//CREATE Tweet - Using the post method for creating/adding new Tweet
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    // const savedPost = await newPost.save();

    // Get the tweet in req.body
    const mappedOverTweet = newPost.tweet.split(" ");
    const mentions = mappedOverTweet.filter((val) => val.startsWith("@"));

    for (const mention of mentions) {
      const username = mention.slice(1); // Remove "@" to get the username

      const user = await User.findOne({ username: username });

      if (!user) {
        console.log(`User ${username} not found`);
        continue; // Skip to the next mention instead of returning
      }

      // Create a notification message
      const notificationMessage = `has mentioned you in a tweet`;

      // Create a notification object with the message and userDetails
      const notification = {
        message: notificationMessage,
        tweets: newPost.tweet,
        tweetId: newPost._id,
        userWhoTagged: newPost.username,
        userWhoTaggedAt: newPost.usersAt,
        userWhoTaggedProfilePic: newPost.profileDp,
      };

      // Find the user whose post was tagged and push the notification object into their notifications array
      await User.findOneAndUpdate(
        { username: username }, // Corrected to use username
        { $push: { notifications: notification } },
        { new: true } // Optional: Return the updated document
      );
    }

    // Save the new post
    await newPost.save();

    res.status(200).json(newPost);
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json(err);
  }
});

//route to Search for tweets
router.get("/search", async (req, res) => {
  const searchQuery = req.query.query;
  try {
    const foundTweets = await Post.find({
      tweet: { $regex: searchQuery, $options: "i" },
    });
    res.json(foundTweets);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "An error occurred while searching for tweets." });
  }
});

// Post.updateMany({},
//   { $set: {profileDp: "" } }
// )
//   .then(() => {
//     console.log("Added profileDp for all users successfully.");
//   })
//   .catch((err) => {
//     console.log("Error updating retweeted array for users:", err);
//   });

// Post.updateMany({ profileDp: { $exists: false } }, { $set: { profileDp: "" } })
//   .then(() => {
//     console.log("ProfileDp field updated for all posts successfully.");
//   })
//   .catch((err) => {
//     console.log("Error updating profileDp field in posts:", err);
//   });

// Post.updateMany(
//   { profileDp: { $exists: false } },
//   { $set: { profileDp: "" } },
//   { validateBeforeSave: false } // Disable validation temporarily
// )
//   .then(() => {
//     console.log("ProfileDp field updated for all posts successfully.");
//   })
//   .catch((err) => {
//     console.log("Error updating profileDp field in posts:", err);
//   });

//Like a tweet
router.put("/liketweet", async (req, res) => {
  let post;
  let user;
  const userDetails = {
    username: req.body.username,
    profileDp: req.body.profileDp,
    usersAt: req.body.usersAt,
    tweets: req.body.tweets,
    id: req.body.id,
    currentUserName: req.body.currentUserName,
    newId: req.body.newId,
    createdAt: Date.now(), // Add the createdAt timestamp
  };
  //Find id in Post and update, then push the userDetails into the likes array
  //What do we need? we get the id
  try {
    post = await Post.findByIdAndUpdate(req.body.id, {
      $push: { likes: userDetails },
      // $push: { User: {notifications: userDetails}}
    });
    // Create a notification message
    const notificationMessage = "liked your tweet";
    // Create a notification object with the message and userDetails
    const notification = {
      message: notificationMessage,
      ...userDetails,
    };
    // Find the user whose post was liked and push the notification object into their notifications array
    user = await User.findOneAndUpdate(
      { username: userDetails.username },
      { $push: { notifications: notification } }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You can't like this post" });
  }
  return res.status(200).json({ message: "You have liked this post" });
});

// //Like a tweet comment
// router.put("/comment-liketweet", async (req, res) => {
//   let post;

//   const userDetails = {
//     username: req.body.username,
//     profileDp: req.body.profileDp,
//     usersAt: req.body.usersAt,
//     postId: req.body.postId,
//     createdAt: req.body.createdAt,
//     likeId: req.body.likeId,
//   };
//   //Find id in Post and update, then push the userDetails into the likes array
//   //What do we need? we get the _id
//   try {
//     post = await Post.findByIdAndUpdate(req.body.likeId, {
//       "$push": { "comments.$[].like":  userDetails },
//     });
//   } catch (err) {
//     console.log(err);
//   }
//   if (!post) {
//     return res.status(404).json({ message: "You cannot like this comment" });
//   }
//   return res.status(200).json({ message: "You just liked this comment" });
// });

//Unlike a Tweet
router.put("/unlike-tweet", async (req, res) => {
  let post;
  const username = req.body.username;

  try {
    // Find the tweet by its ID and pull the object from the likes array with the given username
    post = await Post.findByIdAndUpdate(req.body.id, {
      //pull the object with username provided that is the same with the currentUserName from the likes array
      $pull: { likes: { currentUserName: username } },
    });
  } catch (err) {
    console.log(err);
  }

  if (!post) {
    return res.status(404).json({ message: "You can't unlike this post" });
  }

  return res.status(200).json({ message: "You have unliked this post" });
});

//Retweet a tweet
router.put("/retweet-tweet", async (req, res) => {
  let post;
  let retweet;
  let user;
  const userDetails = {
    username: req.body.username, //the username is for the array of the person whose notifications array i'm updating
    profileDp: req.body.profileDp,
    usersAt: req.body.usersAt,
    _id: req.body.id,
    currentUserName: req.body.currentUserName,
    tweets: req.body.tweets,
    createdAt: Date.now(), // Add the createdAt timestamp
  };
  //Find id in Post and update, then push the userDetails into the likes array
  //What do we need? we get the _id
  try {
    //This part finds the id of the post that was retweeted and pushes the username of the user that liked it
    post = await Post.findByIdAndUpdate(req.body.id, {
      $push: { retweet: userDetails },
    });
    const notificationMessage = "retweeted your tweet";
    // Create a notification object with the message and userDetails
    const notification = {
      message: notificationMessage,
      ...userDetails,
    };
    // Push the retweeted tweet to the Post array of the currentUserName since i want that user to have it in he's post array
    retweet = await User.findOneAndUpdate(
      { username: userDetails.currentUserName },
      { $push: { retweeted: userDetails } }
    );

    // Find the user whose post was liked and push the notification object into their notifications array
    user = await User.findOneAndUpdate(
      { username: userDetails.username },
      { $push: { notifications: notification } }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You can't retweet this post" });
  }
  return res.status(200).json({ message: "You have retweeted this post" });
});

//UnRetweet a Tweet
router.put("/un-retweet", async (req, res) => {
  let unRetweet;
  const username = req.body.username;
  try {
    unRetweet = await Post.findByIdAndUpdate(req.body.id, {
      $pull: { retweet: { currentUserName: username } },
    });
  } catch (err) {
    ("");
    console.log(err);
  }
  if (!unRetweet) {
    return res.status(500).json({ message: "Unable To UnRetweet tweet" });
  }

  return res.status(200).json({ message: "Successfully UnRetweeted tweet" });
});

//Give all existing users a userId
// const updateUserIdInPosts = async () => {
//   try {
//     const posts = await Post.find({}); // Fetch all posts

//     for (const post of posts) {
//       const username = post.username;

//       // Find the associated user and get the _id
//       const user = await User.findOne({ username });
//       if (user) {
//         const userId = user.usersId;
//        post.userId = userId;
//         await post.save();
//       }
//     }

//     console.log('userId field updated in all posts successfully.');
//   } catch (error) {
//     console.error('Error updating userId field in posts:', error);
//   }
// };

// updateUserIdInPosts();

// const updateProfileDpInPosts = async () => {
//   try {
//     const posts = await Post.find({}); // Fetch all posts
//     console.log(posts, "posts");
//     for (const post of posts) {
//       console.log(post, "post");
//       const username = post.username;
//       const id = post._id;
//       console.log(username, "ids");

//       // Find the associated user and get the current profilePic
//       const user = await User.findOne({ username });
//       // console.log(user, "user");
//       if (user) {
//         const profilePic = user.profilePic;

//         post.profileDp = profilePic;
//         // console.log(profilePic, "this is user ProfilePic");
//         // console.log(post.profileDp, "post profileDp")
//         await post.save();
//       }
//     }

//     console.log("ProfileDp field updated in all posts successfully.");
//   } catch (error) {
//     console.error("Error updating profileDp field in posts:", error);
//   }
// };

// updateProfileDpInPosts();

// const updateProfileDpInPosts = async () => {
//   try {
//     const posts = await Post.find(); // Fetch all posts

//     for (const post of posts) {
//       // console.log(post, "This is post");

//       const username = post.username;
//       console.log(username, "This is userId");

//       // Find the associated user and get the current profilePic
//       const user = await User.findOne({ username });
//       // console.log(user, "This is user");
//       const profilePic = user.profilePic;
//       console.log(user.profilePic, "user profilePic");
//       // Update the profileDp field in the post
//       post.profileDp = profilePic;
//       console.log(post.profileDp, "profileDp");
//       //An alternative way to update the profileDp
//       // const profilePic = user.profilePic;
//       // post.profileDp = profilePic;
//       await post.save();
//     }

//     console.log('ProfileDp field updated in all posts successfully.');
//   } catch (error) {
//     console.error('Error updating profileDp field in posts:', error);
//   }
// };

// updateProfileDpInPosts();

// const updateProfileDpInPosts = async () => {
//   try {
//     const posts = await Post.find(); // Fetch all posts

//     for (const post of posts) {
//       const username = post.username;

//       // Find the associated user and get the current profilePic
//       const user = await User.findOne({ username });
//       const profilePic = user.profilePic;

//       // Update the profileDp field in the post
//       post.profileDp = profilePic;
//       // console.log(post.profileDp, "this is profileDp");
//       // console.log(profilePic, "This is profilePic");
//       await post.save();
//     }

//     console.log('ProfileDp field updated in all posts successfully.');
//   } catch (error) {
//     console.error('Error updating profileDp field in posts:', error);
//   }
// };

// updateProfileDpInPosts();

//Comment On A Tweet

//Comment on a tweet
router.put("/comments", async (req, res) => {
  let post;
  let user;

  const userDetails = {
    username: req.body.username,
    usersPic: req.body.usersPic,
    currentUsername: req.body.currentUsername, //This is the actual
    profileDp: req.body.profileDp,
    comments: req.body.comments,
    usersAt: req.body.usersAt,
    picture: req.body.picture,
    video: req.body.video,
    likes: req.body.likes,
    retweet: req.body.retweet,
    _id: req.body.id,
    comment: req.body.comment,
    newId: req.body.newId,
    createdAt: req.body.createdAt, // Add the createdAt timestamp
  };

  try {
    post = await Post.findByIdAndUpdate(
      {
        _id: req.body.id,
      },
      {
        $push: { comments: userDetails },
      }
    );
    // Create a notification message
    const notificationMessage = "commented on your tweet";
    // Create a notification object with the message and userDetails
    const notification = {
      message: notificationMessage,
      ...userDetails,
    };
    console.log(notification, "notifications");
    // Find the user whose post was liked and push the notification object into their notifications array
    user = await User.findOneAndUpdate(
      { username: userDetails.currentUsername },
      { $push: { notifications: notification } }
    );
    console.log(user, "user");
    user.save();
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "Can't Comment On This Post" });
  }
  // console.log(post);
  return res.status(200).json({ message: "Successfully Commented on a Post" });
});

// //Reply someone's comment
// router.put("/replies-comments", async (req, res) => {
//   // const postId = req.body._id;
//   let post;
//   // console.log(req.body._id, "This is postID");

//   const userDetails = {
//     username: req.body.username,
//     photo: req.body.profileDp,
//     comments: req.body.comments,
//     usersAt: req.body.usersAt,
//     picture: req.body.picture,
//     video: req.body.video,
//     postId: req.body.postId,
//     createdAt: req.body.createdAt,
//   };

//   try {
//     post = await Post.findOneAndUpdate(
//       {
//         _id: req.body.postId,
//       },
//       {
//         $push: { comments: {comments: userDetails} },
//       }
//     );
//   } catch (err) {
//     console.log(err);
//   }
//   if (!post) {
//     return res.status(404).json({ message: "Can't Comment On This Post" });
//   }
//   // console.log(post);
//   return res.status(200).json({ message: "Successfully Commented on a Post" });
// });

//Quoted Replies
router.put("/quote-tweet", async (req, res) => {
  // const postId = req.body._id;
  let post;
  let user;

  const userDetails = {
    username: req.body.username, //This is the important bit
    photo: req.body.profileDp,
    comments: req.body.comments,
    usersAt: req.body.usersAt,
    picture: req.body.picture,
    video: req.body.video,
    postId: req.body.postId,
    createdAt: req.body.createdAt,
    newId: req.body.newId,
    currentUsername: req.body.currentUsername,
    createdAt: Date.now(), // Add the createdAt timestamp
  };

  try {
    post = await Post.findByIdAndUpdate(
      {
        _id: req.body.postId,
      },
      {
        $push: { quoted: userDetails },
      }
    );
    // The notification message
    const notificationMessage = "quoted your tweet";
    // The notification object with the message and userDetails
    const notification = {
      message: notificationMessage,
      ...userDetails,
    };
    // Find the user whose post was liked and push the notification object into their notifications array
    user = await User.findOneAndUpdate(
      { username: userDetails.currentUsername },
      { $push: { notifications: notification } }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "Can't Quote this tweet" });
  }
  console.log(post);
  return res.status(200).json({ message: "Successfully Quoted this tweet" });
});

//UPDATE POST - Update all of users post, using the put method, we get the id of what we are updating, we use the post id to update the post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // We want to get the username of a user from the post then we
    if (post.username === req.params.username) {
      //If username from the post(username is in the schema) is the same as username of the post in the url request, then we want the user to be able to update the post
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          { $set: req.body },
          { new: true } //Apparently by default the findByIdAndUpdate method returns the document as it was before the update,
          //But if you set new: true, It will give you how you the object after the update was applied
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can only Update Your post"); //This else statement only runs if you try to update a post that isn't having your username
    }
  } catch (err) {
    res.status(500).json(err); //This catch block only runs if the Id of the user isn't matching
  }
});

//DELETE POST - It's the post id we copy to delete the post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      //If username from the post is the same as username of the post in the request then we want the user to be able to update the post
      try {
        await post.delete();
        res.status(200).json("Post has been Deleted");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can only delete your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET a singlePOST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET a singlePOST
router.get("/:userid", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//ANOTHER WAY FOR GETTING A SINGLE POST WITH ERROR HANDLING
// router.get(async (req, res, next) => {
//   let post;

//   try {
//     post = await Post.findById(req.params.id);
//   } catch (error) {
//     return res.status(404).json({ message: "Unable to find this blog" });
//   }

//   if (!post) {
//     return res.status(404).json({ message: "Cant get this!" });
//   }

//   return res.status(200).json({ post });
// })

// find and populate profileDp with profilePic
// (async () => {
//   let posts
//   try {
//     posts = await Post.find().populate("profileDp", "profilePic");
//     // console.log("Posts:", posts);
//   } catch (err) {
//     console.log("Error fetching posts:", err);
//   }
// })();

//Get all the post of a single user
router.get(`/get-tweet/:username`, async (req, res) => {
  const username = req.params.username;
  let posts;
  try {
    const { page = 1, limit = 10 } = req.query;

    posts = await Post.find({ username })
      .limit(limit * 1)
      .skip(limit * (page - 1) * limit)
      .sort({ _id: -1 });
  } catch (err) {
    res.status(500).json(err);
  }

  if (!posts) {
    return res.status(404).json({ message: "No posts found" });
  }

  return res.status(200).json({ posts });
});

//Like a Tweet Comment
router.put("/:id/:newId/like-comment", async (req, res) => {
  let post;
  const id = req.params.id;
  const newId = req.params.newId;

  const userDetails = {
    username: req.body.username,
    profileDp: req.body.profileDp,
    usersAt: req.body.usersAt,
    postId: req.body.postId,
    createdAt: req.body.createdAt,
    likeId: req.body.likeId,
    createdAt: req.body.createdAt,
  };
  // console.log(userDetails, "userDetails");
  //Find id in Post and update, then push the userDetails into the likes array
  try {
    post = await Post.findOneAndUpdate(
      { _id: id, "comments.newId": newId },
      {
        $push: { "comments.$.likes": userDetails },
      },
      { new: true }
    );

    await post.save();

    console.log(post, "post");
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You cannot like this comment" });
  }
  return res.status(200).json({ post, message: "You just liked this comment" });
});

// UnLike a Tweet Comment
router.put("/:id/:newId/unlike-comment", async (req, res) => {
  let post;
  const id = req.params.id;
  const newId = req.params.newId;

  const userDetails = {
    username: req.body.username,
    profileDp: req.body.profileDp,
    usersAt: req.body.usersAt,
    postId: req.body.postId,
    createdAt: req.body.createdAt,
    likeId: req.body.likeId,
  };
  //Find id in Post and update, then push the userDetails into the likes array
  try {
    post = await Post.findOneAndUpdate(
      { _id: id, "comments.newId": newId },
      { $pull: { "comments.$.likes": userDetails } },
      { multi: true }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You cannot unliked this comment" });
  }
  return res.status(200).json({ message: "You just unLiked this comment" });
});

//Retweet a Tweet Comment
router.put("/:id/:newId/retweet-comment", async (req, res) => {
  let post;
  const id = req.params.id;
  const newId = req.params.newId;

  const userDetails = {
    username: req.body.username,
    profileDp: req.body.profileDp,
    usersAt: req.body.usersAt,
    postId: req.body.postId,
    createdAt: req.body.createdAt,
    retweetId: req.body.retweetId,
  };
  //Find id in Post and update, then push the userDetails into the likes array
  try {
    post = await Post.findOneAndUpdate(
      { _id: id, "comments.newId": newId },
      {
        $push: { "comments.$.retweet": userDetails },
      }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You cannot retweet this comment" });
  }
  return res.status(200).json({ message: "You just retweeted this comment" });
});

//Reply someone's comment
router.put("/:id/:newId/replies-comments", async (req, res) => {
  const id = req.params.id;
  let post;
  let mappedPost;
  const newId = req.params.newId;
  const userDetails = {
    username: req.body.username,
    profileDp: req.body.profileDp,
    comments: req.body.comments,
    usersAt: req.body.usersAt,
    picture: req.body.picture,
    video: req.body.video,
    postId: req.body.postId,
    createdAt: req.body.createdAt,
    newId: req.body.newId,
    like: req.body.like,
    retweet: req.body.retweet,
  };

  try {
    post = await Post.findOneAndUpdate(
      { _id: id, "comments.newId": newId },
      {
        $push: { "comments.$.comment": userDetails },
      }
    );
    post.save();
    // console.log(post, "post");
    mappedPost = post.comments.map((val) => val.comment);
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "Can't Comment On This Post" });
  }
  return res
    .status(200)
    .json({ post: mappedPost, message: "Successfully Commented on a Post" });
});

//Get a single comment
router.get(`/:id/:newId`, async (req, res) => {
  const id = req.params.id;
  const newId = req.params.newId;
  let comments;
  try {
    comments = await Post.find(
      { _id: id, comments: { $elemMatch: { newId: newId } } },
      { "comments.$": 1 }
    );
  } catch (err) {
    res.status(500).json(err);
  }
  if (!comments) {
    return res.status(404).json({ message: "No posts found" });
  }
  return res.status(200).json({ comments });
});

//Get all the post of the people you are following
router.get("/get-tweet/following", async (req, res) => {
  const userId = req.params.username;
  const allUsers = await User.find({});

  // let posts;
  try {
    // console.log(allUsers, "these are all users");
    // posts = await Post.find({ username });
  } catch (err) {
    console.log(err);
  }
});

//GET all posts
router.get("/", async (req, res) => {
  try {
    // const { page } = req.query // Retrieve the page number from the query string
    // const pageNumber = parseInt(page) || 1 // Convert the page number to an integer, default to 1 if not provided

    // const totalTweets = await Post.find({}).countDocuments();  // Get the total number of posts
    // const totalPages = Math.ceil(totalTweets / PAGE_SIZE) // Calculate the total number of pages
    // const posts = await Post.find({})
    //   .sort({ createdAt: -1 }) // Sort by createdAt field in descending order
    //   .skip((pageNumber - 1) * PAGE_SIZE)   // Skip posts based on the page number and page size
    //   .limit(PAGE_SIZE) // Limit the number of posts retrieved per page
    //   .exec();
    // res.status(200).json(posts)
    let posts;
    posts = await Post.find({});
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Show post of only those  who follow me or I am following them
router.get("/:username/following-tweets", async (req, res) => {
  const username = req.params.username;
  let user;
  try {
    user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
  }
});

// Update all documents to include the new field
// Post.updateMany({}, { $set: { followingTweets: [] } })
//   .then((result) => {
//     console.log("Documents updated successfully:", result);
//   })
//   .catch((err) => {
//     console.error("Error updating documents:", err);
//   });

// const posts = await Post.find({ userId: { $in: followingIds } }).populate('userId');

module.exports = router;
