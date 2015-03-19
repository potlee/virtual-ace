window.root = require('./fb');
var users = root.child('users');
window.cache = {};
var currentUser = null;
var _ = require('lodash');
var uuid = require('uuid');

var reset = function (snapshot) {
  users.on('value', function(snapshot) {
    if(!_.isEqual(snapshot.val(), cache)) {
      cache = snapshot.val();
      emitter.emit('change_users');
    }
  });
};

users.on('child_added', reset);
users.on('child_removed', reset);
users.on('child_changed', reset);
users.on('value', reset);

window.User = {
  onlineUsers: function(cb) {
    var now = Date.parse(new Date());
    var out = {};
    Object.keys(cache).forEach(function(username) {
      if((now - cache[username].lastSeen) < 20000)
        out[username] = cache[username];
    });
    return out;
    //return cache;
  },

  create: function(username, favoriteGames, cb) {
    if(cache[username])
      throw new Error('user already exists');
    var user = {};
    users.child(username).set({
      name: username,
      favoriteGames: favoriteGames,
      lastSeen: Date.parse(new Date())
    }, function() {
      this.login(username);
      cb();
    }.bind(this));
  },

  currentUser: function() {
    return localStorage.username;
  },

  login: function(username) {
    if(!cache[username])
      throw new Error("user doesnt exist");
    currentUser = cache[username];
    localStorage.username = currentUser.name;
  },

  logout: function() {
    localStorage.username = null;
  }
};

emitter.on('logout', User.logout);

emitter.on('add_favorite_game', function(name) {
  if(cache[User.currentUser()]) {
    games = cache[User.currentUser()].favoriteGames || [];
    games.push(name);
    users.child(User.currentUser()).update({favoriteGames: games});
  }
});

var updateLastSeen = function() {
  var user = User.currentUser();
  if(user) {
    users.child(user).update({ lastSeen: Date.parse(new Date()), name: user }, function() {
      setTimeout(updateLastSeen, 15000);
    });
  }
};

updateLastSeen();

module.exports = User;
