var _ = require('lodash');
var uuid = require('uuid');
var EventEmitter = require('events').EventEmitter;
window.emitter = new EventEmitter();

var root = require('./fb');
var games = root.child('games');
var gameId = require("./parse_game_id");
var User = require('./user');
window.gameCache = {};
window.x = gameId;
if(gameId !== '') {
  var game = games.child(gameId);
  var reset = function (snapshot) {
    game.on('value', function(snapshot) {
      if(!_.isEqual(snapshot.val(), gameCache)) {
        gameCache = snapshot.val();
        emitter.emit('render_game', gameCache);
      }
    });
  };
  game.on('child_added', reset);
  game.on('child_removed', reset);
  game.on('child_changed', reset);
  game.on('value', reset);

  emitter.once('accept_invite', function() {
    game = games.child(gameId);
    var users = gameCache.users;
    users.push(User.currentUser());
    game.update({users: users});
  });

  emitter.on('move_card', function(card, position, location) {
    console.log('move card emitted');
    game.child('cards').child(card).update({ position: position, username: 'table', location: location });
  });
  emitter.on('move_card_to_hand', function(card) {
    console.log('move card to hand emitted');
    game.child('cards').child(card).update({ username: User.currentUser() });
  });
  emitter.on('flip_card', function(card) {
    console.log('flip card emitted');
    game.child('cards').child(card).update({ faceup: !gameCache.cards[card].faceup });
  });
  emitter.on('end_turn', function() {
    game.child('turn');
  });
} else {
  emitter.on('start_new_game', function(usernames, name, cb) {
    console.log('starting new game');
    var gameId = uuid.v4();
    var game = games.child(gameId);
    var cards = {};
    ['H', 'D', 'C', 'S'].forEach(function(suit) {
      [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
        cards[value + suit] = {
          position: {x:0,y:0,z:0}, faceup: true, username: 'table', location: 'table'
        };
      });
    });
    game.set({
      cards: cards,
      invitedUsers: usernames,
      turn: User.currentUser(),
      name: name,
      id: gameId,
      dealer: User.currentUser(),
      users: [ User.currentUser() ]
    }, function() { cb(gameId); });
  });
  games.on('child_added', function(child) {
    var snapshot = child.val();
    if(snapshot.invitedUsers.indexOf(User.currentUser()) != -1) {
      location.href = '/index.html?gameId=' + snapshot.id;
    }
  });
}

module.exports = emitter;
