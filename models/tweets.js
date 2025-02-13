const mongoose = require('mongoose');

const tweetSchema = mongoose.Schema({
  content: {type: String, required: true},
  like: {type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

const Tweet = mongoose.model('tweets', tweetSchema);

module.exports = Tweet;