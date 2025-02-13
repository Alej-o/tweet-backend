const mongoose = require('mongoose');

const hashtagsSchema = mongoose.Schema({
  name: {type: String, required: true},
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'tweets', required: true }],
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

const Hashtags = mongoose.model('hashtags', hashtagsSchema);

module.exports = Hashtags;