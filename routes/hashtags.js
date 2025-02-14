var express = require('express');
var router = express.Router();
const Hashtags = require('../models/hashtags');


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

router.get("/tweetByHashtag", async (req, res) => {
 
    let { hashtag } = req.query; 

    if (!hashtag) {
      return res.json({ error: "Hashtag requis" });
    }
    if (!hashtag.startsWith("#")) {
      hashtag = `#${hashtag}`;
  }
    const hashtagData = await Hashtags.findOne({ name: hashtag });

    if (!hashtagData) {
      return res.json({ error: "Hashtag non trouvé" });
    }
   
    const populatedHashtag = await Hashtags.findById(hashtagData._id)
    .populate({
      path: 'tweets',
      populate: {
        path: 'user',
        select: 'username firstname'
      }
    })
    populatedHashtag.tweets.sort((a, b) => b.createdAt - a.createdAt);
    res.json({  populatedHashtag });
 
});



 
  module.exports = router;