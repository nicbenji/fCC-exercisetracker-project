const mongoose = require('mongoose');
require('dotenv').config();

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
  await user.save();
  return {
    username: user.username,
    _id: user._id
  }
}

const getUsers = async () => {
  return await User.find({}).select({ __v: 0 });
}

const getUserById = async (userId) => {
  return await User.findById(userId).select({ username: 1, _id: 0 });
}

exports.createUser = createUser;
exports.getUsers = getUsers;

const exerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
});

const Exercise = new mongoose.model('Exercise', exerciseSchema);

const createExercise = async (userId, description, duration, date = new Date()) => {
  const exercise = new Exercise({
    user: userId,
    description,
    duration,
    date
  });
  await exercise.save();
  return {
    username: getUserById(userId),
    description,
    duration,
    date: date.toDateString(),
    _id: userId
  }
}

