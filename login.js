var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const app = express();

const db = require('./models');

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/login.html'));
});

const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/');
};

app.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    try {
      const user = await db.User.findOne({ where: { userName: username } });
      const validPassword = await user.validPassword(password);
      if (validPassword) {
        const { userName, email } = user;
        req.session.user = {
          userName,
          email
        };
        res.redirect('/dashboard');
      }
      throw new Error('Incorrect Password');
    } catch (err) {
      res.send('Incorrect Username or Password');
    }
  } else {
    response.send('Please enter Username and Password!');
  }
});

app.get('/dashboard', isAuthenticated, function(request, response) {
  response.send('Welcome back, ' + request.session.user.userName);
});

app.get('/anotherTest', isAuthenticated, function(request, response) {
  response.send('Another example, ' + request.session.user.userName + '!');
});

app.get('/logout', (req, res) => {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
