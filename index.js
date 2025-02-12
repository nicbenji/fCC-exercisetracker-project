const express = require('express')
const app = express()
const cors = require('cors')
const { createUser, getUsers } = require('./schemas')
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

app.post('/api/users/:_id/exercises', async (res, req) => {

});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
