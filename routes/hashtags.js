var express = require('express');
var router = express.Router();
const Hashtags = require('../models/hashtags');
const Tweet = require('../models/tweets');


router.get("/", async(req, res) => {
	const allHashtags = await Hashtags.find();
  const allHashtagsData = allHashtags.map(hashtag => ({
    name: hashtag.name,
    tweetCount: hashtag.tweets.length
}))
      .sort((a, b) => b.tweetCount - a.tweetCount)
    .slice(0, 10); 
		res.json({ hashtags: allHashtagsData});
	
});

 
  module.exports = router;