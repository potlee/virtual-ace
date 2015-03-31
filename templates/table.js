//Globals
var flip_card = function() { console.log("Not yet loaded") };
var duration = 300000;

$(function() {
					
	BrowserDetection();

	// set timeout duration
	
	timeout = setTimeout();
	// Disable highlight text for all but inputs
	$('*:not(:input)').disableSelection();
	$('.cardDealt').hide();
	
	create_events();
	create_jquery_widgets();
	

	
	emitter.on('render_game', render_game);
	emitter.on('cards_dealt', cards_dealt);
	emitter.on('invitation', game_invite);

	//Rendering the ownership boxes. Should be ran after handling all
	//invitations and before starting the game.
	emitter.on('render_users', render_users);
		
	//The array to keep track of the number of cards in each hand
	var hand_count = [];
	
	var zIndexCounter = 0;
	var prevJAlert = null;
	
	
	//Handles hand re-rendering after refreshing the page in
	//render_game()
	$(window).unload(function(){
		localStorage.setItem("reentered"  + gameCache.id, true);
		localStorage.setItem("firstRender"  + gameCache.id, true);
		localStorage.setItem("cardsDealt"  + gameCache.id, false);
	});
	
	function render_users(){
		$("aside #owner div").remove();
		
		$.each(gameCache.users, function(key, value){
		
			//changes the border for the current turn's player
			if(value != gameCache.turn){
				$("aside.playingCards #owner").append($("<div/>")
					.attr("data-location", value)
					.css({"height": (100/ gameCache.users.length) + "%" })
					.addClass("droppable")
					.append($("<span/>")
						.text(value)
						)
				);
			} else {
				$("aside.playingCards #owner").append($("<div/>")
					.attr("data-location", value)
					.addClass("droppable")
					.css({"height": (100/ gameCache.users.length) + "%", "border": "2px solid #00FF00"})
					.append($("<span/>")
						.text(value)
						.css({"color": "#00FF00"})
						)
				);
			}
			
		});
		
		
		create_jquery_widgets();
	}
	
	//adds the number of cards in each player's hand to the
	//ownership boxes.
	function update_users(){
		$("aside.playingCards #owner div").not(".card").each(function(){
			$(this).append($("<div/>")
				.attr("id", "hand_count")
				.text(" Cards: " + hand_count[$(this).attr("data-location")])
			);
		});
	}
	
	// This is the event that gets triggered after deep changes gameCache after deal();
	// It will REPLACE the hand, not add to it.
	function cards_dealt() {
		console.log('cards_dealt');
		if(prevJAlert != null) {
			prevJAlert.closeAlert(true);
		}
		
		render_hand();
		render_game();
	}

	function render_hand() {
		console.log('render_hand');
		$("#hand .card").remove();
		$.each(window.gameCache.cards, function(key, value){
			// Foreach card the player owns, put it in their hand
			if(value.username == User.currentUser()) {
				$("#hand").append(create_card(key, value.faceup));
			}
		});
		
		
	}
	
	function first_render_game() {
		//Handles re-rendering the cards in the hand if the user
		//leaves or refreshes the page. reads from local storage
		var reEntered =  localStorage.getItem("reentered" + gameCache.id);
		
		
		if(reEntered == "true") {
			render_hand();
			zIndexCounter = getHighestZIndex($(".card").not("#hand .card"));
			localStorage.setItem("reentered" + gameCache.id, false);
			return;
		}
		
		
		// If the  current user isnt already in the game, then send then an 
		// invite.
		if($.inArray(User.currentUser(), gameCache.users) == -1) {
			game_invite(gameCache.dealer, gameCache.id);
		}
	}
	
	
	function render_game(){
		console.log('render_game BRIANNNNNNNNNNN');
		//Display the game's name in the footer.
		$("#gameName").text(gameCache.name);
		
		render_users();

		var beginHandCount = 0;
		//set the card count of each player's hand to be zero
		$.each(gameCache.users, function(key, value){			
			if(hand_count[value]) {
				beginHandCount += hand_count[value];
			}
		});
		
			
		//set the card count of each player's hand to be zero
		$.each(gameCache.users, function(key, value){
			hand_count[value] = 0;
		});
		
		//removes all card divs
		$(".card").not("#hand .card").remove();
		
		
		//go through each card and create them.
		$.each(window.gameCache.cards, function(key, value){
		//do checks for users/table or hand checks here.
		//Since we do not render cards in hands, we only need to 
		//add to the hand card count for cards owned by players
			switch (value.username){
				case "table":			
						$('.droppable[data-location=\''+value.location+'\']')
						.append(create_card(key, value.faceup)
							.css({
								"top" : value.position.y+'%',
								"left" : value.position.x+'%', 
								"z-index" : value.position.z
							})
						);
						var zindex = parseInt(value.position.z, 10);
						if(zindex > zIndexCounter) {
							zIndexCounter = zindex;
						}
						break;
				default:
						hand_count[value.username]++;
			}
			
		});
		
		
		//Prevent other players from moving cards when it is not their turn
		if(User.currentUser() == window.gameCache.turn) {
			make_cards_draggable();
		}
			
		console.log('-------------- render_game()');
		
		//Since the ownership boxes must be rendered before the cards
		//are rendered, we have to update the player hand count after
		//all the cards are rendered.
		update_users();


		oneTimeRun('firstRender', first_render_game);
		
		var allReplied =  localStorage.getItem("allInvitesReplied"  + gameCache.id);
		var IReplied = localStorage.getItem("IReplied" + gameCache.id);
				
		var accepted = (User.currentUser() == gameCache.dealer || IReplied == "true");
		if(accepted && allReplied != "true") {
			inviteNotifications();
		}
		
		if(beginHandCount == 0) {	
			$.each(gameCache.users, function(key, value){
					// Someone got a card, set dealt flag
					console.log(key, value, hand_count[value]);
					if(hand_count[value] > 0) {
						console.log('cards_dealt should be run');
						oneTimeRun('cardsDealt', cards_dealt);
						return false; // break out of $.each
 					}
			});
		}
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
		} else {
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
			stack: false,
			containment: '#bounds',
			start : function(event, ui) {
				zIndexCounter++
				$(this).css("z-index",zIndexCounter);
			}
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
			  ui.item.draggable('option', 'disabled', 'true');
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
					
					zIndexCounter++;
					
					$(clone).css({
						width: '',
						height: '',
						'z-index' : zIndexCounter
					});
					
					$(this).append(clone);
					
					$(clone).draggable({
						connectToSortable: '#hand',
						revert: 'invalid',
						stack: false,
						containment: '#bounds',
						start : function(event, ui) {
							zIndexCounter++;
							$(this).css("z-index",zIndexCounter);
						}
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
				window.clearTimeout(timeout);
				timeout = setTimeout();
			}
		});
	}


	flip_card = function(card) {
		var card_val = $(card).data('card');
		$(card).toggleClass("back");
		
		console.log('flip_card('+card_val+')');
		emitter.emit('flip_card', card_val);
		
		window.clearTimeout(timeout);
		timeout = setTimeout();
	}
	
	
	function create_events() {

		$('body').bind('contextmenu', function(){ return false });
			
		$("body").mousedown(function(event) {
			//Prevent other players from flipping cards when it is not their turn
			if(User.currentUser() != window.gameCache.turn) {
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
					flip_card(el);
					console.log(el);
					event.preventDefault();
					break;
				default:
					alert('You have a strange Mouse!');
			}
		});

		

		// buttons
		$( '.next' ).click(function() {
			if(User.currentUser() == window.gameCache.turn) {
				console.log('end_turn()');
				emitter.emit('end_turn');
			}
		});
		
		$('.finish').click(function() {
			emitter.emit('leave_game');
			//gameComplete();
		});
		
	} // create_events
	
	
	
	function game_invite(dealer, gameid) {
		$.fn.jAlert({
			'title': 'Invitation sent by ' + dealer,
			'theme': 'success',
			'message': ' ',
			'size': 'medium',
			'closeBtn': false,
			'clickAnywhere': false,
			'hideOnEsc': false,
			'btn': [{
				'label': 'Accept Invite',
				'cssClass': 'green',
				'onClick': function() {
					console.log('accept_invite()');
					emitter.emit('accept_invite'); 
					localStorage.setItem("IReplied"  + gameCache.id, true);
					inviteNotifications();
				}
			},{
				'label': 'Decline Invite',
				'cssClass': 'green',
				'onClick': function() {
					console.log('reject_invite()');
					emitter.emit('reject_invite');
				}
			}],
			
			'autofocus': 'btn:last'
		}); //$.fn.jAlert
		
	}
	
	
	function gameComplete() {
		
		$.fn.jAlert({
			'title': 'Game Complete',
			'theme': 'success',
			'size': 'small',
			'closeBtn': true,
			'clickAnywhere': false,
			'hideOnEsc': true,
			'btn': [{
				'label': 'Begin New Game',
				'cssClass': 'green',
				'onClick': function() {
					dealCardsPrompt();
				}
			},{
				'label': 'Return to Lobby',
				'cssClass': 'green',
				'onClick': function() {
					console.log('leave_game()');
					emitter.emit('leave_game'); 
				}
			}],
			'onClose': function(){
				emitter.emit('leave_game'); 
			},
			'autofocus': 'btn:last'
		}); //$.fn.jAlert
		
		
		// brian
	}

	function prompt(title, message, call) {
		LeapController.updownswipeable = true;
		$.fn.jAlert({
			'title': title,
			'message': message +
						'<br>'+
						'<form style="text-align:center">'+
							'<input class="updownswipeable" type="number" size="2" step="1" min="0" max="52" value="0">'+
						'</form>',
			'theme': 'success',
			'size': 'small',
			'closeBtn': false,
			'clickAnywhere': false,
			'hideOnEsc': false,
			'btn': [{
				'label': 'Deal',
				'onClick': function() {
					var value = $('.jContent > form :input').val();
					console.log(''+call+'(' + value + ')');
					LeapController.updownswipeable = false;
					emitter.emit(call, value);
				}
			}],
			
			'autofocus': 'btn:last'
		});
	}

	function inviteNotifications() {
	
		if(gameCache.invitedUsers == null) {
			var invitedUsersLen = 0;
		} else {
			var invitedUsersLen = gameCache.invitedUsers.length;
		}
		
		var total =  invitedUsersLen+1;  // 4
		var pending = gameCache.users.length;  //4-1 3

		if(pending == total) {
			localStorage.setItem("allInvitesReplied"  + gameCache.id, true);
			
			if(User.currentUser() == gameCache.dealer) {
				dealCardsPrompt();
			} else {
				 prevJAlert = $.fn.jAlert({
					'title': 'Waiting',
					'message': 'Waiting to be dealt',
					'theme': 'success',
					'size': 'small',
					'closeBtn': true,
					'clickAnywhere': true,
					'hideOnEsc': true,
					'autofocus': 'btn:last',
					'replace': true
				});
			}
			return;
		}
				
		 prevJAlert = $.fn.jAlert({
			'title': 'Invitations',
			'message': pending + '/' + total,
			'theme': 'success',
			'size': 'small',
			'closeBtn': true,
			'clickAnywhere': true,
			'hideOnEsc': true,
			'autofocus': 'btn:last',
			'replace': true
		});
	}
	
	function dealCardsPrompt() {
		if(gameCache.users.length <= 1) {
			emitter.emit('deal', 0);
		} else {
			$.fn.jAlert({
				'title': 'Begin Game',
				'message': ' ',
				'theme': 'success',
				'size': 'small',
				'closeBtn': false,
				'clickAnywhere': false,
				'hideOnEsc': false,
				'btn': [{
					'label': 'Shuffle and Deal',
					'cssClass': 'green',
					'onClick': function() {
						prompt("Deal and Shuffle", "Number of Cards to be Dealt", "deal");
					}
				}, {
					'label': 'Deal',
					'cssClass': 'green',
					'onClick': function() {
						prompt("Deal", "Number of Cards to be Dealt", "deal");
					}
				}],
				'autofocus': 'btn:last',
				'replace' : true
			});
		}

	}
	
	 function BrowserDetection() {      
		//Check if browser is IE or not
		if (navigator.userAgent.search("MSIE") >= 0) {
			$.fn.jAlert({
				'title':'Error!',
				'message': 'Please reopen page using Chrome, Firefox, or Safari',
				'theme': 'error'
			});
		}
    }
    
    function getHighestZIndex(q) {
		var highest = 0;
		q.each(function() {
			var index_current = parseInt($(this).css("zIndex"), 10);
			if(index_current > highest) {
				highest = index_current;
			}
		});
		console.log("Highest z index was: " + highest);
		return highest;
    }
    
    function oneTimeRun(name, func) {
		//console.log('oneTimeRun('+name+', '+func+')');
		var hasItRan = localStorage.getItem(name + gameCache.id);
		if(hasItRan != "true") {
			func();
			localStorage.setItem(name + gameCache.id, true);
		}
    }
    
    function setTimeout() {
    	var timeout = window.setTimeout(function(){
			console.log('timeout');
			emitter.emit('leave_game'); 
		}, duration);
		return timeout;
    }
    
});
