const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/Users");

//CREATE POST - Using the post method for creating/adding new Post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//Like a Post
router.put("/liketweet", async (req, res) => {
  let post;

  const userDetails = {
    username: req.body.username,
    photo: req.body.photo,
    userAt: req.body.userAt,
  };
  //Find id in Post and update, then push the userDetails into the likes array
  //What do we need? we get the _id
  try {
    post = await Post.findByIdAndUpdate(req.body.postId, {
      $push: { likes: userDetails },
    });
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "You can't like this post" });
  }
  return res.status(200).json({ message: "You have liked this post" });
});

//Unlike a post
router.put("/unlike-tweet", async (req, res) => {
  let like;
  const userDetails = {
    username: req.body.username,
    photo: req.body.photo,
    userAt: req.body.userAt,
  };
  try {
    like = await Post.findByIdAndUpdate(
      {
        _id: req.body.postId,
      },
      { $pull: { likes: userDetails } },
      { multi: true }
    );
  } catch (err) {
    ("");
    console.log(err);
  }
  if (!like) {
    return res.status(500).json({ message: "Unable To Dislike" });
  }

  return res.status(200).json({ message: "Successfully Disliked fr" });
});

//Comment On A Post
router.put("/comments", async (req, res) => {
  // const postId = req.body._id;
  let post;
  // console.log(req.body._id, "This is postID");

  const userDetails = {
    username: req.body.username,
    photo: req.body.photo,
    comments: req.body.comments,
  };

  try {
    post = await Post.findByIdAndUpdate(
      {
        _id: req.body.postId,
      },
      {
        $push: { comments: userDetails },
      }
    );
  } catch (err) {
    console.log(err);
  }
  if (!post) {
    return res.status(404).json({ message: "Can't Comment On This Post" });
  }
  console.log(post);
  return res.status(200).json({ message: "Successfully Commented on a Post" });
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

//Get all the post of a single user
router.get(`/get-post/:username`, async (req, res) => {
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

//GET all posts
//Step 1: Get username and catName from req.query.user
//Step 2: Let posts be anything, meaning it could be anything
//Step 3: If it's username, find username in Post and assign it to posts which could be anything
//step 4: Else if there's no username let's find categories then we use the $in method to say (if it's inside) that's our catName
router.get("/", async (req, res) => {
  const username = req.query.user;
  const profession = req.query.profession;
  const categoryName = req.query.cat;
  try {
    let posts;
    if ((username, profession)) {
      //Finds username in the POst Model then Returns a Post model(object) with a specific username
      posts = await Post.find({ username, profession });
    } else if (categoryName) {
      posts = await Post.find({
        categories: {
          $in: [categoryName],
        },
      });
    } else {
      posts = await Post.find();
      // console.log(posts);
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
