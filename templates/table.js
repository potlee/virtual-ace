$(function() {
	// Disable highlight text for all but inputs
	$('*:not(:input)').disableSelection();
	$('.cardDealt').hide();

	//emitter.emit('start_game', ["deep"]);
	
	create_events();
	create_jquery_widgets();
	
	emitter.on('render_game', render_game);

	emitter.on('invitation', game_invite);
	
	//Rendering the ownership boxes. Should be ran after handling all
	//invitations and before starting the game.
	emitter.on('render_users', render_users);
	
	function render_users(){
	var userslist = ['Yahooize', 'Vanilla mousse', 'Fat Idol'];
	
		$.each(/*window.gameCache.users*/ userslist, function(key, value){
			$("aside.playingCards").append($("<div/>")
					.attr("data-location", value)
					.css({"height": (100/ /*window.gameCache.users.length*/ userslist.length) + "%" })
					.addClass("droppable")
					.text(value)
					);
		});
	}
	
	
	function render_game(){

		if(window.cardsDealt != true && User.currentUser() == gameCache.dealer) {
			dealCards();
			window.cardsDealt = true;
		}
			
		if($.inArray(User.currentUser(), gameCache.users) == -1) {
			game_invite(gameCache.dealer, gameCache.id);
		}
		
		
		
		//removes all card divs
		$(".card").remove();
		
		
		
		//go through each card and create them.
				
		//=== does not change data types of either side
		//-- Currently only distinguishes between hand and table, ownership
		//-- should be implemented later (create ownership id by username, then
		//--(#'username').append( )etc.)
		$.each(window.gameCache.cards, function(key, value){
		//do checks for users/table or hand checks here.


			switch (value.username){
				case User.currentUser():
						$("#hand").append(create_card(key, value.faceup));
						break;
					
				case "table":			
						$('.droppable[data-location=\''+value.location+'\']').append(create_card(key, value.faceup)
							.css({
								"top" : value.position.y+'%',
								"left" : value.position.x+'%', 
								"z-index" : value.position.z
							})
						);
						break;
				default:
						//The case where someone else owns the card, may have to
						//consider ownership boxes later but right now don't render the card.
						//keep count of cards in the users hands.
			}
			
		});
		
		//Prevent other players from moving cards when it is not their turn
		if(User.currentUser() == window.gameCache.turn)
			make_cards_draggable();
		console.log('-------------- render_game()');		
	}

	
	//parameters: The data_card (AS, 1H, 10D, or etc), and whether or not the card is faceup.
	//returns: a div object of the card. to be appended to whatever div it goes to.
	//i.e. $("#hand").append(create_card("7D", true));
	function create_card(data_card, faceup){
		var rank = parse_rank(data_card);
		var suit = parse_suit(data_card);
		var symbol = parse_symbol(suit);
		
		var rank_lower = rank.toLowerCase();
		var back = " back";
		
		if(faceup){
			back = "";
		}
		
		//var str = "<div data-card=" + rank + suit.charAt(0).toUpperCase() + " class=\"card rank-" + rank_lower + " " + suit + back + "\"><span class=\"rank\">" + rank + "</span><span class=\"suit\">&" + suit + ";</span></div>";
		//return str;
		return $("<div/>")
					.attr("data-card", data_card)
					.addClass("card rank-" + rank_lower + " " + suit + back)
					.append($("<span/>")
						.addClass("rank")
						.text(rank)
					)
					.append($("<span/>")
						.addClass("suit")
						//.text("&" + suit + ";")
						.text(symbol)
				);
						
						
	};
		
	//Takes a data_card (AC, 2H, 4C, etc) and gets the rank)
	function parse_rank(data_card){
		if(data_card.length == 3){
			return data_card.charAt(0) + data_card.charAt(1);
		}
		else{
			return data_card.charAt(0);
		}
	};
	
	//Takes a data_card (AC, 2H, 4C, etc) and gets the suit in text
	function parse_suit(data_card){
		switch (data_card.charAt(data_card.length - 1)) {
			case "C":
				return "clubs";
				break;
				
			case "D":
				return "diams";
				break;
				
			case "H":
				return "hearts";
				break;
			
			case "S":
				return "spades";
				break;
				
			default:
				return "";
				break;
		}
	};
	
	//Takes a data_card (AC, 2H, 4C, etc) and gets the suit symbol
	//doing .append("<span/>").text("&diams;") doesn't work, this works
	//around using that by just using the actual symbol.
	function parse_symbol(suit){
		switch (suit) {
			case "clubs":
				return "♣";
				break;
				
			case "diams":
				return "♦";
				break;
				
			case "hearts":
				return "♥";
				break;
			
			case "spades":
				return "♠";
				break;
				
			default:
				return "";
				break;
		}
	};
	

	function make_cards_draggable() {
		// Make only droppable cards sortable because cards in hand
		// because sortable when we run sortable()
		$('.droppable .card').draggable({
			connectToSortable: '#hand',
			revert: 'invalid',
			stack: 'div',
			containment: '#bounds'
		});
	}
	
	function create_jquery_widgets() {
		$("#hand").sortable({
			revert: 100,
			connectWith: '#hand, .droppable',
			containment: '#bounds',
			receive: function(event, ui) {
			  var card = ui.item.data('card');
			  console.log('move_card_to_hand(\''+card+'\')');
			  emitter.emit('move_card_to_hand', card);
			},
			beforeStop: function (event, ui) {
				ui.item.css('position', 'relative');
			}
		});

		$(".droppable").droppable({
			tolerance: "intersect",
			out: function (ev, ui) {
				window.origin = this;
			},
			drop: function (ev, ui) {
				
				if(User.currentUser() != window.gameCache.turn) {
					return;
				}
				
				if((window.origin !== null && this != window.origin) || ui.draggable.parent().hasClass('ui-sortable')) {
					var clone = ui.draggable.clone();
					ui.draggable.remove();
					
					$(clone).css({
						width: '',
						height: ''
					});
					
					$(this).append(clone);
					
					$(clone).draggable({
						connectToSortable: '#hand',
						revert: 'invalid',
						stack: 'div',
						containment: '#bounds'
					});
					
					ui.draggable = clone;
				}
				
				window.origin = null;

				var left = $(ui.draggable).position().left;
				var top  = $(ui.draggable).position().top;
				var percentLeft = (left / $(window).width()) * 100;
				var precentTop  = (top / $(window).height()) * 100;
				var position = { left: percentLeft+'%', top: precentTop +'%' };

				
				$(ui.draggable).css(position);  
				var zIndex = $(ui.draggable).zIndex();
				var location = $(this).data('location');
				var cardString = $(ui.draggable).data('card');
				console.log('move_card(\''+cardString+'\', { left: '+percentLeft+'%, top: '+precentTop+'% }, zindex: '+zIndex+', location: '+location+')');
				emitter.emit('move_card', cardString, {x: percentLeft, y: precentTop, z: zIndex}, location);
			}
		});
	}

	function create_events() {

		$('body').bind('contextmenu', function(){ return false });
			
		$("body").mousedown(function(event) {
			//Prevent other players from flipping cards when it is not their turn
			if(User.currentUser != window.gameCache.turn) {
				return;
			}
			
			var el = document.elementFromPoint(event.clientX,event.clientY);
			
			var card = false;
			
			if($(el).hasClass('card')) {
				card = true;
			} else {
				var parentCard = $(el).parents('.card')[0];
				if(parentCard) {
					card = true;
					el = parentCard;
				}
			}
			
			if(!card) return;
			
			switch (event.which) {
				case 2:
					//alert('Left Mouse button pressed.');
					break;
				case 1:
					//alert('Middle Mouse button pressed.');
					
					break;
				case 3:
					//alert('Right Mouse button pressed.');
					$(el).toggleClass("back");
					var card = $(el).data('card');
					console.log('flip_card('+card+')');
					emitter.emit('flip_card', card);
					event.preventDefault();
					break;
				default:
					alert('You have a strange Mouse!');
			}
		});

					

		// buttons
		$( '.next' ).click(function() {
			if(User.currentUser() != window.gameCache.turn) {
				console.log('end_turn()');
				emitter.emit('end_turn');
			}
		});
		
		$('.finish').click(function() {
			gameComplete();
		});
		
	} // create_events
	
	
	
	function game_invite(dealer, gameid) {
		$.fn.jAlert({
			'title': 'Invitation sent by ' + dealer,
			'theme': 'success',
			'size': 'small',
			'btn': [{
				'label': 'Accept Invite',
				'cssClass': 'green',
				'onClick': function() {
					console.log('accept_invite()');
					emitter.emit('accept_invite'); 
				}
			},{
				'label': 'Decline Invite',
				'cssClass': 'green',
				'onClick': function() {
					console.log('leave_game()');
					emitter.emit('leave_game'); 
				}
			}],
			'closeBtn': false,
			'autofocus': 'btn:last'
		}); //$.fn.jAlert
	}
	
	
	function gameComplete() {
		if(User.currentUser() != window.gameCache.turn) {
			return;
		}
		
		$.fn.jAlert({
			'title': 'Game Complete',
			'theme': 'success',
			'size': 'small',
			'btn': [{
				'label': 'Begin New Game',
				'cssClass': 'green',
				'onClick': function() {
					dealCards();
				}
			},{
				'label': 'Return to Lobby',
				'cssClass': 'green',
				'onClick': function() {
					console.log('leave_game()');
					emitter.emit('leave_game'); 
				}
			}],
			'closeBtn': false,
			'autofocus': 'btn:last'
		}); //$.fn.jAlert
	}

	function prompt(title, message, call) {
		$.fn.jAlert({
			'title': title,
			'message': message+'<br><form style="text-align:center"><input type="text" size=2 value="0"></form>',
			'theme': 'success',
			'size': 'small',
			'btn': [{
				'label': 'Deal',
				'onClick': function() {
					var value = $('.jContent > form :input').val();
					console.log(''+call+'(' + value + ')');
					emitter.emit(call, value);
				}
			}],
			'closeBtn': false,
			'autofocus': 'btn:last'
		});
	}
	
	
	function dealCards() {
		$.fn.jAlert({
			'title': 'Begin Game',
			'message': '#cards to be dealt',
			'theme': 'success',
			'size': 'small',
			'btn': [{
				'label': 'Shuffle and Deal',
				'cssClass': 'green',
				'onClick': function() {
					prompt("Deal and Shuffle", "Number of Cards to be Dealt", "deal_and_shuffle");
				}
			}, {
				'label': 'Deal',
				'cssClass': 'green',
				'onClick': function() {
					prompt("Deal", "Number of Cards to be Dealt", "deal");
				}
			}, {
				'label': 'Skip',
				'onClick': function() {
					console.log('start_game()???');
				}
			}],
			'closeBtn': false,
			'autofocus': 'btn:last'
		});
	}
});
