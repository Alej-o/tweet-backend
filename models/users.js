const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  firstname: {type: String, required: true},
  username: {type: String, required: true, unique: true},
  password: {type: String},
  token: {type: String},
  createdAt: {type: Date, default: Date.now},
  updateAt: {type: Date, default: Date.now}
});

const User = mongoose.model('users', userSchema);

module.exports = User;