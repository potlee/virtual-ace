var EventEmitter = require('events').EventEmitter;
var emitter = new EventEmitter();
var root = require('./fb');
var game = root.child('game');
var User = require('./user');
window.gameCache = {};
var reset = function (snapshot) {
  gameCache = snapshot.val();
  rerender();
  console.log(gameCache);
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
      cards[value + suit] = {position: {x:0,y:0,z:0}, faceup: true};
    });
  });
  game.set({cards: cards, users: users, turn: users[0]});
});

emitter.on('move_card', function(card, position) {
  game.child('cards').child(card).update({ position: position }, rerender);
});
emitter.on('move_card_to_hand', function(card) {
  game.child('cards').child(card).update({ username: User.currentUser.name }, rerender);
});
emitter.on('flip_card', function(card) {
  game.child('cards').child(card).update({ faceup: !gameCache[card].flipped }, rerender);
});

module.exports = emitter;
global.emitter = emitter;
