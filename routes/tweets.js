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
        const allHashtags = await Hashtags.find();
        const allHashtagsData = allHashtags.map(hashtag => ({
            name: hashtag.name,
            tweetCount: hashtag.tweets.length
        }))
		.sort((a, b) => b.tweetCount - a.tweetCount)
		.slice(0, 10); 

        res.status(201).json({ result: true, content: populatedTweet, hashtags: allHashtagsData });

    } catch (error) {
        console.error("Error in /addTweet:", error);
        res.status(500).json({ result: false, error: 'Internal server error' });
    }
});

//Supprimer un tweet via ID
router.delete("/:id", async(req, res) => {
	const deleteTweetById = Tweet.findByIdAndDelete(req.params.id)
			if (!deleteTweetById) {
				return res.json({ result: false, error: "Tweet item not found" });
			}
			res.json({ result: true });
});
//
router.get("/", async(req, res) => {
	const allTweet = await Tweet.find().populate("user")
		res.json({ tweets: allTweet});
	
});


module.exports = router;