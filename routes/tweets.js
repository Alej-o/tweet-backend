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

            newTweet.save().then(data => {
                const tweetRegex = /#[a-z0-9_]+/gi;
                const hashtags = req.body.content.match(tweetRegex) ;

                let allHashtags = [];  
                let processed = 0;  

                if (hashtags.length === 0) {
                    res.json({ result: true, content: data, hashtags: [] });
                    return;
                }
                Hashtags.find({ name: { $in: hashtags } }).then(existingHashtags => {
                    existingHashtags.forEach(existingHashtag => {
                        allHashtags.push(existingHashtag.name);
                    });
                    hashtags.forEach(hashtag => {
                        if (!existingHashtags.some(h => h.name === hashtag)) {
                            const newHashtag = new Hashtags({
                                name: hashtag,
                                tweets: [newTweet._id]
                            });

                            newHashtag.save().then(savedHashtag => {
                                allHashtags.push(savedHashtag.name);  
                            });
                        }
                    });
                    processed++;
                    if (processed === hashtags.length) {
                        res.json({ result: true, content: data, hashtags: allHashtags });
                    }
                });

            });
        })
        .catch(err => res.status(500).json({ result: false, error: err.message }));
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