var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var PORT = process.env.PORT || 8000;

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var connection = mysql.createConnection(process.env.JAWSDB_URL);

var app = express();

app.use(
  session({
    secret: 'secret',
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

function isManager(req, res, next) {
  if (req.session.role == 'manager') {
    return next();
  }
  res.send('You must be a manager to view this page!');
}

app.post('/auth', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    connection.query(
      'SELECT * FROM accounts WHERE username = ? AND password = ?',
      [username, password],
      function(error, results, fields) {
        if (results.length > 0) {
          // save keys on the session object to access throughout your routes
          request.session.loggedin = true;
          request.session.username = username;
          request.session.birthday = results[0].birthday;
          response.redirect('/dashboard');
        } else {
          response.send('Incorrect Username and/or Password!');
        }
        response.end();
      }
    );
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
  response.send(
    'Welcome back, ' +
      request.session.username +
      '! Your brthday is' +
      request.session.birthday
  );
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
