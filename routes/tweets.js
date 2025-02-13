var express = require('express');
var router = express.Router();
const { checkBody } = require('../modules/checkBodyTweet');
const Tweet = require('../models/tweets');
const Hashtags = require('../models/hashtags');

router.post('/addTweet', (req, res) => {
  if (!checkBody(req.body, ['content'])) {
      res.json({ result: false, error: 'Missing or empty fields' });
      return;
  }
  const newTweet = new Tweet({
      content: req.body.content,
      like: req.body.like
  });
  newTweet.save()

  .then(data => {
      res.json({ result: true, content: data });
    const tweetRegex = /#[a-zA-Z0-9_]+/g;
    const hashtags = req.body.content.match(tweetRegex)


      const newHashtag = new Hashtags({
          name: hashtags,  
          tweet: newTweet._id
      });
    
      return newHashtag.save();
  })
  // .then(newHashtagsItem => {
  //     return Hashtags.findById(newHashtagsItem._id);
  // })
  // .then(data => {
  //     res.json({ result: true, hashtags: data});
  // })
  
});



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
router.get("/:id", (req, res) => {
    Tweet.findById().then(data => {
      res.json({ tweet: data });
    });
  });


module.exports = router;