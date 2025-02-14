const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    tweetId: { type: mongoose.Schema.Types.ObjectId, ref: "Tweet", required: true },
  }, { timestamps: true }); 
  
  likeSchema.index({ userId: 1, tweetId: 1 }, { unique: true });

const Like = mongoose.model('likes', likeSchema);

module.exports = Like;