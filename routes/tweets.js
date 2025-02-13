var express = require('express');
var router = express.Router();
const { checkBodyTweet } = require('../modules/checkBodyTweet');
const Tweet = require('../models/tweets');
const Hashtags = require('../models/hashtags');
const User = require('../models/users');


router.post('/addTweet', (req, res) => {
	if (!checkBodyTweet(req.body, ['content', 'token'])) {
		res.json({ result: false, error: 'Missing or empty fields' });
		return;
	}
	User.findOne({ token: req.body.token })
		.then(userData => {
			if (!userData) {
				res.json({ result: false, error: 'User not found' });
				return;
			}
			const newTweet = new Tweet({
				content: req.body.content,
				like: req.body.like,
				user: userData._id
			});
			return newTweet.save().then(data => {
				res.json({ result: true, content: data });
	
				const tweetRegex = /#[a-z0-9_]+/gi;
				const hashtags = req.body.content.match(tweetRegex);
	
				hashtags.forEach(hashtag => {
					Hashtags.findOne({ name: hashtag })
						.then(existingHashtag => {
							if (existingHashtag) {
								existingHashtag.tweets.push(newTweet._id);
								return existingHashtag.save();
							} else {
								const newHashtag = new Hashtags({
									name: hashtag,
									tweets: newTweet._id
								});
								return newHashtag.save();
	
							}
	
						})
	
				});
			})
		})
		
});


// .then(newHashtagsItem => {
//     return Hashtags.findById(newHashtagsItem._id);
// })
// .then(data => {
//     res.json({ result: true, hashtags: data});
// })
//Supprimer un tweet via ID
router.delete("/:id", (req, res) => {
	Tweet.findByIdAndDelete(req.params.id)
		.then(deletedTweet => {
			if (!deletedTweet) {
				return res.json({ result: false, error: "Tweet item not found" });
			}
			res.json({ result: true });
		})
});
//
router.get("/", (req, res) => {
	Tweet.find().populate("user").then(data => {
		res.json({ tweets: data });
	});
});


module.exports = router;