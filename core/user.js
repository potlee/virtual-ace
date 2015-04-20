window.root = require('./fb');
var users = root.child('users');
var cache = {};
var currentUser = null;
var _ = require('lodash');
window.l = require('lodash');
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
  },

  create: function(username, favoriteGames, cb) {
    if(cache[username])
      throw new Error('user already exists');
    var user = {};
    users.child(username).set({
      name: username,
      favoriteGames: favoriteGames,
      lastSeen: Date.parse(new Date()),
      level: "1"
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
      throw new Error("This user doesn't exist.");
    localStorage.leapLevel = cache[username].level;
    console.log(this.onlineUsers());
    if(this.onlineUsers()[username])
      throw new Error("This user is already online.");
    currentUser = cache[username];
    localStorage.username = currentUser.name;
  },

  logout: function() {
    localStorage.username = null;
  },

  setLevel: function(level) {
    localStorage.leapLevel = level;
    users.child(this.currentUser()).update({ level: level});
  },

  getLevel: function() {
    return cache[User.currentUser()].level;
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

emitter.on('remove_favorite_game', function (game) {
  if(cache[User.currentUser()]) {
    games = cache[User.currentUser()].favoriteGames || [];
    games = games.filter(function(name) {
      return name != game;
    });
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
