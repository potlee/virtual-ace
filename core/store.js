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
  emitter.on('leave_game', function() {
    var left = gameCache.left;
    left.push(User.currentUser());
    game.update({left: left}, function() {
      location.href = '/lobby.html';
    });
  });
  emitter.on('deal', function(num) {
    var offset = 0;
    cards = gameCache.cards;
    cardsArray = Object.keys(cards).map(function(key) {
      return cards[key];
    });
    //cardsArray = cardsArray.sort(function(a,b) { return a.position.z < b.position.z; });
    gameCache.users.forEach(function(user) {
      var i = 0;
      while(i++ <= num) {
        cardsArray[offset++].username = user;
        console.log(user);
      }
    });
    game.update({cards: cards});
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
      users: [ User.currentUser() ],
      left: ['none']
    }, function() { cb(gameId); });
  });
  games.on('child_added', function(child, parent) {
    var snapshot = child.val();
    if(snapshot.turn) {
      if(snapshot.invitedUsers.indexOf(User.currentUser()) != -1 &&
         snapshot.left.indexOf(User.currentUser()) == -1
        ) {
        location.href = '/index.html?gameId=' + snapshot.id;
      }
    }
  });
}

module.exports = emitter;
