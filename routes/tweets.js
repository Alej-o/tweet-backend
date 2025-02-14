var express = require('express');
var router = express.Router();
const { checkBodyTweet } = require('../modules/checkBodyTweet');
const Tweet = require('../models/tweets');
const Hashtags = require('../models/hashtags');
const User = require('../models/users');


router.post('/addTweet', async (req, res) => {
    try {
        if (!checkBodyTweet(req.body, ['content', 'token'])) {
            return res.json({ result: false, error: 'Missing or empty fields' });
        }
        const userData = await User.findOne({ token: req.body.token });
        if (!userData) {
            return res.json({ result: false, error: 'User not found' });
        }
        const newTweet = new Tweet({
            content: req.body.content,
            like: req.body.like,
            user: userData._id
        });

        const savedTweet = await newTweet.save();

        const tweetRegex = /#[a-z0-9_]+/gi;
        const hashtags = req.body.content.match(tweetRegex);

        await Promise.all(
            hashtags.map(async (hashtag) => {
                await Hashtags.findOneAndUpdate(
                    { name: hashtag },
                    { $addToSet: { tweets: savedTweet._id } },
                    { upsert: true, new: true }
                );
            })
        );
        const populatedTweet = await Tweet.findById(savedTweet._id).populate('user', 'username firstname');

        res.status(201).json({ result: true, content: populatedTweet });

    } catch (error) {
        console.error("Error in /addTweet:", error);
        res.status(500).json({ result: false, error: 'Internal server error' });
    }
});

//Supprimer un tweet via ID
router.delete("/:id", async (req, res) => {
    const { token } = req.query;
    const { id } = req.params;

    if (!token) return res.json({ result: false, error: "I need the token!" });

    try {
        const user = await User.findOne({ token: token });
        if (user === null) return res.json({ result: false, error: "No user matching the token!" });

        const deleteTweetById = await Tweet.findOneAndDelete({ _id: id, user: { _id: user._id } });
        if (deleteTweetById === null) return res.json({ result: false, error: "Tweet not found" });

        return res.json({ result: true });
    } catch (e) {
        console.error('Error in Route DELETE /tweets/:id =>', e)
        return res.status(500).json({ result: false, error: e.message });
    }

});
//
router.get("/", async (req, res) => {
    const { token } = req.query;

    const user = await User.findOne({token: token}).select('_id');

    const tweets = await Tweet.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
            },
        },
        { $unwind: "$user" },
        {
            $lookup: {
                from: "likes",
                let: { tweetId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $and: [{ $eq: ["$tweetId", "$$tweetId"] }, { $eq: ["$userId", user._id] }] } } },
                    { $limit: 1 },
                ],
                as: "likedByUser",
            },
        },
        {
            $addFields: {
                isLiked: { $gt: [{ $size: "$likedByUser" }, 0] }, 
            },
        },
        {
            $project: {
                content: 1,
                like: 1,
                user: { token : 1, username: 1, firstname: 1 }, 
                isLiked: 1,
                createdAt: 1,
            },
        }, {
            $sort: { createdAt: -1 }
        }
    ]);
    // const allTweet = await Tweet.find().populate("user").sort({ createdAt: -1 })
    res.json({ tweets: tweets });

});


module.exports = router;