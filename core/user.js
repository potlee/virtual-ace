var root = require('./fb');
var users = root.child('users');
var cache = {};
var currentUser = null;

var reset = function (snapshot) {
  cache = snapshot.val();
  console.log(cache);
};

users.on('child_added', reset);
users.on('child_removed', reset);
users.on('child_changed', reset);
users.on('value', reset);

User = {
  onlineUsers: function() {
    return cache;
  },

  create: function(username, favoriteGames, cb) {
    if(cache[username])
      throw new Error('user already exists');
    var user = {};
    user[username] = { name: username, favoriteGames: favoriteGames };
    users.update(user, cb);
  },

  currentUser: function() {
    return currentUser;
  },

  login: function(username) {
    currentUser = cache[username];
  }
};

module.exports = User;

global.User = User;
