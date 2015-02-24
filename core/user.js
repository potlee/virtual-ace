var root = require('./fb');
var users = root.child('users');
var cache = {};
var currentUser = null;

var reset = function (snapshot) {
  users.on('value', function(snapshot) {
    cache = snapshot.val();
  });
  //console.log(cache);
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
    if(!localStorage.username)
      localStorage.username = ["Condomman", "Squishypoo", "Retbull", "Love to laugh", "The king", "Long and hard", "Braveheart", "Demon of Death", "ZombieMage", "Fat Idol", "Short Circuit", "Yahooize", "Ice Geek", "Hockey undecided", "Hitch hiker", "Twister", "Rocky road dream", "Tiger apple", "Vanilla mousse", "John"][Math.round(Math.random() * 20)];
    return localStorage.username;

  },

  login: function(username) {
    currentUser = cache[username];
  }
};

module.exports = User;

global.User = User;
