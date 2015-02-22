var emitter = new require('events').EventEmitter;

var cards = {};

var initDeck = function() {
  ['H', 'D', 'C', 'S'].forEach(function(suit) {
    [2,3,4,5,6,7,8,9,'J','K','Q','A'].forEach(function(value) {
      cards[value + suit] = {position: [0,0]};
    });
  });
  fb.set({cards: cards});
};

initDeck();
emitter.on('move_card', function() {

});

//module.exports = fb;
