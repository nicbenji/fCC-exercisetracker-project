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

const findUserByName = async (username) => {
  return await User.findOne({ username: username }).select({ __v: 0 });
}

const getUsers = async () => {
  return await User.find({}).select({ __v: 0 });
}

exports.findUserByName = findUserByName;
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

const createExercise = async (userId, description, duration, date) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid ObjectId');
  }
  if (isNaN(duration)) {
    throw new Error('Please enter a number for the duration')
  }
  const exercise = new Exercise({
    user: userId,
    description,
    duration,
    date
  });
  await exercise.save();
  const populatedExercise = await exercise.populate('user');
  return {
    username: populatedExercise.user.username,
    description,
    duration,
    date: date.toDateString(),
    _id: populatedExercise.user._id
  }
}

exports.createExercise = createExercise;

userSchema.virtual('log', {
  ref: 'Exercise',
  localField: '_id',
  foreignField: 'user',
});

userSchema.set('toJSON', { virtuals: true });

// TODO:Match filter in populate currently is not working -> no idea why
// workaround implemented using .filter() on the output
const getUserLogs = async (userId, from, to, limit) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid ObjectId');
  }
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new Error('Invalid Date')
  }
  if (isNaN(limit)) {
    throw new Error('Limit is NaN')
  }

  const user = await User.findById(userId).populate({
    path: 'log',
    options: {
      match: { date: { $gte: from, $lte: to } },
      select: 'description duration date -_id',
      sort: { date: -1 },
      limit: limit
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    username: user.username,
    count: user.log.length,
    _id: user._id,
    log: user.log
      // .filter((exercise) => exercise.date.getTime() >= from.getTime() && exercise.date.getTime() <= to.getTime())
      .map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }))
  }

}

exports.getUserLogs = getUserLogs;
