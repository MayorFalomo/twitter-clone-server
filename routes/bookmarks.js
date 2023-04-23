const router = require('express').Router();
const Bookmarks = require('../models/Bookmarks')

router.post('/addBookmark', async (req, res, next) => {
    let bookmark;
    
    try {
        bookmark = new Bookmarks({
            profileDp: req.body.profileDp,
            username: req.body.username,
            usersAt: req.body.usersAt,
            tweet: req.body.tweet,
            picture: req.body.picture,
            video: req.body.video,
            likes: req.body.likes,
            comments: req.body.comments,
            createdAt: req.body.createdAt,
            postId: req.body.postId,
            saved: true,
        })
        await bookmark.save()
    } catch (err) {
        console.log(err);
    }
    if (!bookmark) {
        return res.status(404).json({message: "Couldn't add Bookmark"})
    }
    return res.status(200).json({message: "Successfully Updated"})
})

router.get('/get-bookmark/:id', async (req, res, next) => {
    const userId = req.params.id;
    let bookmark;
    try {
        bookmark = await Bookmarks.findById(userId);
    } catch (err) {
       return res.status(404).json({message: "Unable to find Bookmark"})
    }
    if (!bookmark) {
        return res.status(404).json({message: "Can't get this Bookmark"}) 
    } else {
        return res.status(200).json(bookmark)
    }
})

router.delete('/delete-bookmark/:id', async (req, res, next) => {
    let bookmarkId = req.params.id;
    let bookmark;
    try {
        bookmark = await Bookmarks.findOneAndRemove({postId: bookmarkId});
    } catch (err) {
        console.log(err);
    }
    if (!bookmark) {
        return res.status(404).json({message: "Can't delete this Bookmark"})
    }
    return res.status(200).json({message: "Successfully Deleted Bookmark"})
})

module.exports = router;