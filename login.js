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

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + '/login.html'));
});

// This is a middleware function we can use it as a second arguments in all our routes that need auth
// the next function will just allow the route to continue with the normal functioning of the route
// Otherwise if the user is not logged in (no active session) the will be redirected to '/' (login screen)
function isAuthenticated(req, res, next) {
  if (req.session.loggedin) {
    return next();
  }
  res.redirect('/');
}

app.post('/auth', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  var userData;
  if (username && password) {
    db.User.findOne({ where: { userName: username } })
      .then(user => {
        if (!user) {
          response.send('User does not exist!');
        }
        userData = user;
        return user;
      })
      .then(user => user.validPassword(password))
      .then(result => {
        if (result) {
          request.session.loggedin = true;
          request.session.username = userData.userName;
          response.redirect('/dashboard');
        }
        response.send('Invalid Login!');
        response.end();
      });
  } else {
    response.send('Please enter Username and Password!');
    response.end();
  }
});

app.get('/dashboard', isAuthenticated, function(request, response) {
  // I would use request.session.birthday here as a param in your external API url
  // and then assemble it in the packet for the with username, etc
  // maybe something like this

  // var data = {
  //   username: req.session.username,
  //   // apiResponse would be the response from the external API and I'm just making up the keys
  //   currentHoroscope: apiResponse.todaysHoroscope
  // };
  response.send('Welcome back, ' + request.session.username);
});

// just an extra route to to test request session data
app.get('/anotherTest', isAuthenticated, function(request, response) {
  response.send('Another example, ' + request.session.username + '!');
});

// This can be attached to a logout button anywhere in your views with an onclick listener
app.get('/logout', (req, res) => {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

app.listen(PORT);
