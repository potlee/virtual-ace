var root = require('./fb');
var users = root.child('users');
var cache = {};
var currentUser = null;
var _ = require('lodash');

var reset = function (snapshot) {
  users.on('value', function(snapshot) {
    if(!_.isEqual(snapshot.val(), cache)) {
      cache = snapshot.val();
    }
  });
  emitter.emit('change_users');
};

users.on('child_added', reset);
users.on('child_removed', reset);
users.on('child_changed', reset);
users.on('value', reset);



User = {
  onlineUsers: function() {
    //var heartbeat = root.child('heartbeat')
    //heartbeat.set('value', User.currentUser);
    //heartbeat.on('child_changed', function() {
      
    //});
    return cache;
  },

  create: function(username, favoriteGames, cb) {
    if(cache[username])
      throw new Error('user already exists');
    var user = {};
    user[username] = { name: username, favoriteGames: favoriteGames };
    users.update(user, cb);
    this.login(username);
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
emitter.on('add_favorite_game', function(name) {
  if(cache[User.currentUser()]) {
    games = cache[User.currentUser()].favoriteGames || [];
    games.push(name);
    users.child(User.currentUser()).update({favoriteGames: games});
  }
});

module.exports = User;

global.User = User;
