const router = require("express").Router();
const Post = require("../models/Post.js");
const User = require("../models/Users");

//Route to get custom tweet for that user based on their blocked users and uninterested tweets
router.get("/:username/your-tweets", async (req, res) => {
  const username = req.params.username;
  try {
    // Find the current user using their username
    const currentUser = await User.findOne({ username });

    //Next I Get the blocked users username and the IDS of the tweet marked as uninterested in the currentUsers Uninterested array
    const blockedUsers = currentUser.blocked.map((user) => user.username);
    const uninterestedPostsIds = currentUser.unInterestedPosts.map(
      (post) => post.id
    );

    //Then first I Find all the tweets, but return only the ones that are not blocked and not in the uninterested posts
    //So using the $and operator I can combine parameters so it checks in both arrays
    //Note that $nin stands for *Not In*
    //Lastly i added a sort method to sort out everything based on the time it was createdAt
    const posts = await Post.find({
      $and: [
        { username: { $nin: blockedUsers } },
        { _id: { $nin: uninterestedPostsIds } },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// //GET all posts using the curerentusers username as params
// //I'm using username for the route to find the user because the usernames are also unique and works without issues across the entire backend setip
// router.get("/:username/your-tweets", async (req, res) => {
//   //First i get the name from the request parameter
//   const username = req.params.username;
//   try {
//     // Next i find all the posts
//     const posts = await Post.find({});

//     //Then I Find the currentUsers object using the findOne method from Mongo
//     const currentUser = await User.findOne({ username });

//     //Get all the usernames from the currentUsers blocked array, This should return an array of usernames
//     const blockedUsers = currentUser.blocked.map((user) => user.username);
//     const uninterestedTweetsId = currentUser.unInterestedPosts.map(
//       (tweet) => tweet.id
//     );

//     if (blockedUsers == []) {
//       return res.status(200).json(posts);
//     }
//     // console.log(blockedUsers, "Blocked Users Id");

//     //Then i Filter out the blocked users from the retrieved posts by saying basically filter out all the post where blockedUsers is not included by their username
//     const filteredTweets = posts.filter(
//       (post) => !blockedUsers.includes(post.username)
//     );
//     const uninterestedTweets = posts.filter(
//       (tweet) => !uninterestedTweetsId.includes(tweet._id)
//     );

//     const combinedTweets = [...filteredTweets, ...uninterestedTweets];
//     // console.log(filteredTweets, "filtered");
//     //Return the filteredPosts
//     return res.status(200).json(combinedTweets);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//Report a Tweet
router.put("/:id/report-tweet", async (req, res) => {
  const { username } = req.body;
  const id = req.params.id;
  try {
    const currentUser = await User.findOne({ username });
    const tweet = await Post.findById(id);

    currentUser.reported.push({ id: tweet._id });
    await currentUser.save();
    return res.status(200).json("Tweet reported");
  } catch (err) {
    res.status(500).json(err);
  }
});

//Mark a post as uninterested
router.put("/:id/mark-as-uninterested", async (req, res) => {
  const { id } = req.params;

  const { username } = req.body;
  try {
    const tweet = await Post.findById(id);
    const currentUser = await User.findOne({ username: username });
    const posts = await Post.find({});

    // console.log(currentUser, "current User");
    if (!tweet) {
      return res.status(404).json("Post not found");
    }

    const search = currentUser.unInterestedPosts.some(
      (p) => p.id === tweet._id
    );
    // console.log(search, "currentUser");
    if (search) {
      return res
        .status(400)
        .json({ message: "Tweet has already been marked as uninterested" });
    }

    const pushed = currentUser.unInterestedPosts.push({
      id: tweet._id,
      username: tweet.username,
      tweet: tweet.tweet,
      picture: tweet.picture,
      video: tweet.video,
    });

    console.log(pushed, "pushed");

    if (pushed) {
      await currentUser.save();
    }

    //Get all the usernames from the currentUsers blocked array, This should return an array of usernames
    // const blockedUsers = currentUser.blocked.map((user) => user.username);
    // const uninterested = currentUser.unInterestedPosts
    // if (blockedUsers == []) {
    //   return res.status(200).json(posts);
    // }

    //? This would return all tweets from nonblocked users
    // const filteredBlockedTweets = posts.filter(
    //   (post) => !blockedUsers.includes(post.username)
    // );

    //     const filteredUninterestedTweets = await Post.find({
    //   _id: { $nin: currentUser.unInterestedPosts.map((p) => p.id) },
    // });
    // console.log(filteredTweets, "filteredTweets");

    return res.status(200).json({
      currentUser,
      // filteredTweets: filteredTweets,
      message: "Post marked as uninterested",
    });
  } catch (error) {
    console.log(error, "error has occurred");
    return res
      .status(500)
      .json({ message: "An Error marking tweet as occurred" });
  }
});

module.exports = router;
