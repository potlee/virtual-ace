var _ = require('lodash');
var uuid = require('uuid');
var EventEmitter = require('events').EventEmitter;
window.emitter = new EventEmitter();

var root = require('./fb');
window.games = root.child('games');
var gameId = require("./parse_game_id");
var User = require('./user');

window.gameCache = {};

var gameAdded = function(child, parent) {
  var snapshot = child.val();
  if(snapshot.turn) {
    if((snapshot.invitedUsers || []).indexOf(User.currentUser()) != -1) {
      location.href = '/table.html?gameId=' + snapshot.id;
    }
  }
};

if(gameId !== '') {
  games.on('child_removed', function (oldGameSnapshot) {
    if(oldGameSnapshot.val().id == gameId)
      location.href = '/lobby.html';
  });
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
    games.child(gameId).child('users').transaction(function(users) {
      users.push(User.currentUser());
      return users;
    });
  });

  emitter.on('move_card', function(card, position, location) {
    game.child('cards').child(card).update({ position: position, username: 'table', location: location });
  });

  emitter.on('clear_table', function() {
    var cards = {};
    ['H', 'D', 'C', 'S'].forEach(function(suit) {
      [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
        cards[value + suit] = {
          position: {x:10,y:10,z:0}, faceup: false, username: 'table', location: 'table'
        };
      });
    });
    game.update({ cards: cards });
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
    var position = gameCache.users.indexOf(gameCache.turn);
    position++;
    game.update({turn: gameCache.users[position % gameCache.users.length]});
  });
  emitter.on('leave_game', function() {
    game.remove(function() {
      location.href = '/lobby.html';
    });
  });
  emitter.on('reject_invite', function() {
    games.child(gameId).child('invitedUsers').transaction(function(users) {
      users = users.filter(function(user) {
        return user != User.currentUser();
      });
      return users;
    }, function() {
      location.href = '/lobby.html';
    });
  });
  emitter.on('restart_game', function() {
    var users = gameCache.users;
    var name = gameCache.name;
    games.once('child_added', child_added);
    game.remove();
    emitter.emit('start_new_game', users, name);
  });
  emitter.on('deal', function(num) {
    var offset = 0;
    indexes = _.shuffle(_.range(1,52));
    cards = gameCache.cards;
    for(var c in cards) {
      cards[c].position.z = indexes.pop();
    }
    cardsArray = Object.keys(cards).map(function(key) {
      return cards[key];
    });
    gameCache.users.forEach(function(user) {
      var i = 0;
      while(i++ < num) {
        cardsArray[offset++].username = user;
        cardsArray[offset - 1].faceup = true;
        console.log(user);
      }
    });
    game.update({cards: cards}, function() {
      emitter.emit('cards_dealt');
      //emitter.emit('render_game');
    });
  });
} else {
  games.on('child_added', gameAdded);
}

emitter.on('start_new_game', function(usernames, name) {
  console.log(JSON.stringify(usernames));
  var gameId = uuid.v4();
  var game = games.child(gameId);
  var cards = {};
  ['H', 'D', 'C', 'S'].forEach(function(suit) {
    [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
      cards[value + suit] = {
        position: {x:10,y:10,z:0}, faceup: false, username: 'table', location: 'table'
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
  }, function() { window.location.href = '/table.html?gameId=' + gameId; });
});

module.exports = emitter;
