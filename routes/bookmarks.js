const router = require("express").Router();
const Bookmarks = require("../models/Bookmarks");

router.post("/addBookmark", async (req, res, next) => {
  let bookmark;

  try {
    const bookmarking = new Bookmarks(req.body);

    if (!bookmarking) {
      return res.status(404).json({ message: "Couldn't add Bookmark" });
    }

    await bookmarking.save();

    return res
      .status(200)
      .json({ bookmarking, message: "Successfully Updated" });
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: "Failed to bookmark" });
  }
});

router.get("/get-bookmark/:id", async (req, res, next) => {
  const userId = req.params.id;
  let bookmark;
  try {
    bookmark = await Bookmarks.find({ userDetail: userId });
  } catch (err) {
    return res.status(404).json({ message: "Unable to find Bookmark" });
  }
  if (!bookmark) {
    return res.status(404).json({ message: "Can't get this Bookmark" });
  }
  return res.status(200).json(bookmark);
});

//Delete a Bookmark
router.delete("/delete-bookmark/:id", async (req, res, next) => {
  let bookmarkId = req.params.id;
  let bookmark;

  try {
    console.log(bookmarkId, "bookmarkId");
    bookmark = await Bookmarks.findOneAndRemove({ postId: bookmarkId });
    await bookmark.save();
    console.log(bookmark, "bookmark first");
  } catch (err) {
    console.log(err);
  }
  if (!bookmark) {
    return res.status(404).json({ message: "Can't delete this Bookmark" });
  }
  return res
    .status(200)
    .json({ bookmark: bookmark, message: "Successfully Deleted Bookmark" });
});

module.exports = router;
