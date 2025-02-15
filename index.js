const express = require('express')
const app = express()
const cors = require('cors')
const { createUser, getUsers, createExercise, getUserLogs } = require('./schemas')
require('dotenv').config()

app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.route('/api/users')
  .post(async (req, res) => {
    try {
      const user = await createUser(req.body.username);
      res.json(user);
    } catch (err) {
      console.error(err);
      if (err.errorResponse.code === 11000) {
        res.json({ error: 'Username already taken' });
      }
    }
  })
  .get(async (_req, res) => {
    try {
      const users = await getUsers();
      res.json(users);
    } catch (err) {
      console.error(err);
    }
  });

app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const exercise = await createExercise(req.params._id, req.body.description, req.body.duration, date);
    res.json(exercise);
  } catch (err) {
    console.error(err);
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const from = req.query.from ? new Date(req.query.from) : new Date(0);
    const to = req.query.to ? new Date(req.query.to, 23, 59, 59, 999) : new Date();
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 0;
    const userWithLogs = await getUserLogs(req.params._id, from, to, limit);
    res.json(userWithLogs);
  } catch (err) {
    console.error(err);
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
