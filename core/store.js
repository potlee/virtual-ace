var EventEmitter = require('events').EventEmitter;
global.emitter = new EventEmitter();
var root = require('./fb');
var games = root.child('games');
if(localStorage.gameId)
  var game = games.child(localStorage.gameId);
else
  var game = null;
var User = require('./user');
var _ = require('lodash');
window.gameCache = {};

var reset = function (snapshot) {
  game.on('value', function(snapshot) {
    if(!_.isEqual(snapshot.val(), gameCache)) {
      gameCache = snapshot.val();
      rerender();
    }
  });
};

game.on('child_added', reset);
game.on('child_removed', reset);
game.on('child_changed', reset);
game.on('value', reset);

games.on('child_added', function(child) {
  if(child.invitedUsers.indexOf(User.currentUser()) != -1) {
    localStorage.gameId = child.id;
    game = games.child(localStorage.gameId);
  }
});

var rerender = function() { emitter.emit('render_game', gameCache); };

emitter.on('start_new_game', function(usernames, name, cb) {
  localStorage.gameId = Math.random();
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
global.emitter = emitter;
