var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const uid2 = require('uid2');
const { checkBody } = require('../modules/checkBody');
const User = require('../models/users');
//inscription
router.post('/signup', async (req, res) => {
  if (!checkBody(req.body, ['firstname','username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const data = await User.findOne({ username: req.body.username })
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);

      const newUser = new User({
        firstname: req.body.firstname,
        username: req.body.username,
        password: hash,
        token: uid2(32)
      });
      const saveTweet=  await newUser.save()
        res.json({ result: true, token: saveTweet.token });
     
    } else {
      res.json({ result: false, error: 'User already exists' });
    }
});
// connexion
router.post('/signin', async(req, res) => {
  if (!checkBody(req.body, ['username', 'password'])) {
    res.json({ result: false, error: 'Missing or empty fields' });
    return;
  }

  const userData = await User.findOne({ username: req.body.username })
    if (userData && bcrypt.compareSync(req.body.password, userData.password)) {
      res.json({ result: true, token: userData.token, firstname: userData.firstname });
    } else {
      res.json({ result: false, error: 'User not found or wrong password' });
    }
 
});

module.exports = router;
