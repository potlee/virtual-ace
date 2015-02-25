var EventEmitter = require('events').EventEmitter;
window.emitter = new EventEmitter();
var root = require('./fb');
var games = root.child('games');
var uuid = require('uuid');
if(localStorage.gameId)
  var game = games.child(localStorage.gameId);
else
  var game = null;
var User = require('./user');
var _ = require('lodash');
window.gameCache = {};
var rerender = function() { emitter.emit('render_game', gameCache); };

var reset = function (snapshot) {
  game.on('value', function(snapshot) {
    if(!_.isEqual(snapshot.val(), gameCache)) {
      gameCache = snapshot.val();
      rerender();
    }
  });
};
listen = function() {
  game.on('child_added', reset);
  game.on('child_removed', reset);
  game.on('child_changed', reset);
  game.on('value', reset);
};
if(game) listen();

games.on('child_added', function(child) {
  var snapshot = child.val();
  if(snapshot.invitedUsers.indexOf(User.currentUser()) != -1) {
    localStorage.gameId = snapshot.id;
    game = games.child(localStorage.gameId);
    listen();
  }
});

emitter.on('start_new_game', function(usernames, name, cb) {
  console.log('starting new game');
  localStorage.gameId = uuid.v4();
  game = games.child(localStorage.gameId);
  var cards = {};
  ['H', 'D', 'C', 'S'].forEach(function(suit) {
    [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
      cards[value + suit] = {
        position: {x:0,y:0,z:0}, faceup: true, username: 'table', location: 'table'
      };
    });
  });
  game.set({ cards: cards, invitedUsers: usernames, turn: User.currentUser(), name: name, id: localStorage.gameId }, cb);
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

module.exports = emitter;
