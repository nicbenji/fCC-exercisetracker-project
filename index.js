const express = require('express')
const app = express()
const cors = require('cors')
const { createUser } = require('./schemas')
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
      res.json({ error: 'Username already taken' });
    }
  })
  .get(async (req, res) => {

  });



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
