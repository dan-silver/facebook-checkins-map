
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , FB = require('fb')
  , path = require('path');

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;
var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session({ secret: 'your secret here' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});
app.get('/map', ensureAuthenticated, routes.map);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
if (process.env.PORT) {
	var callbackURL = "https://facebook-map.herokuapp.com/auth/facebook/callback"
} else {
	var callbackURL = "http://localhost:3000/auth/facebook/callback"
}
passport.use(new FacebookStrategy({
    clientID: 'INSERT CLIENT ID HERE',
    clientSecret: 'INSER CLIENT SECRET HERE',
    callbackURL: callbackURL
  },
  function(accessToken, refreshToken, profile, done) {
		profile.accessToken = accessToken;
		return done(null, profile);
  }
));
app.get('/', passport.authenticate('facebook', {scope: ['friends_status', 'friends_events']}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/map');
  });
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}