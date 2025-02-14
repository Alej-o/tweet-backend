var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkBody');
const Tweet = require('../models/tweets');
const User = require('../models/users');
const Like = require('../models/likes');

router.post('/addLike', async (req, res) => {
    try {
        if (!checkBody(req.body, ['token', 'tweetId'])) {
            return res.json({ result: false, error: 'Missing or empty fields' });
        }

        const userData = await User.findOne({ token: req.body.token });
        if (!userData) {
            return res.json({ result: false, error: 'User not found' });
        }

        const verifLike = await Like.findOne({ userId: userData._id, tweetId: req.body.tweetId });
        if (verifLike) {
            return res.json({ result: false, error: 'Tweet already liked' });
        }

        const like = new Like({ userId: userData._id, tweetId: req.body.tweetId });
        await like.save();
        
        const tweet = await Tweet.findByIdAndUpdate(req.body.tweetId, { $inc: { like : 1 } },{ new: true });
        if (!tweet) {
            return res.json({ result: false, error: 'Tweet not found' });
        }

        res.json({ result: true, likeCount: tweet.like });
    } catch (error) {
        console.error("Error in /addLike:", error);
        res.status(500).json({ result: false, error: 'Internal server error' });
    }
});

module.exports = router;



