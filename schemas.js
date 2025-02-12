const mongoose = require('mongoose');
require('dotenv');

mongoose.connect(process.env.MONGO_URI);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
});

const User = new mongoose.model('User', userSchema);

const createUser = async (username) => {
  const user = new User({
    username: username
  });
  return await user.save();
}

exports.createUser = createUser;

