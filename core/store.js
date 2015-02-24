var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var root = require('./fb');
var game = root.child('game');
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

var rerender = function() { emitter.emit('render_game', gameCache); };

emitter.on('start_game', function(users) {
  var cards = {};
  ['H', 'D', 'C', 'S'].forEach(function(suit) {
    [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
      cards[value + suit] = {position: {x:0,y:0,z:0}, faceup: true, username: 'table', location: 'table'};
    });
  });
  game.set({cards: cards, users: users, turn: users[0]});
});

emitter.on('move_card', function(card, position) {
  console.log('move card emitted');
  game.child('cards').child(card).update({ position: position, username: 'table' });
});
emitter.on('move_card_to_hand', function(card) {
  console.log('move card to hand emitted');
  game.child('cards').child(card).update({ username: User.currentUser() });
});
emitter.on('flip_card', function(card) {
  console.log('flip card emitted');
  game.child('cards').child(card).update({ faceup: !gameCache.cards[card].faceup }, rerender);
});
emitter.on('end_turn', function() {
  game.child('turn');
});

module.exports = emitter;
global.emitter = emitter;
