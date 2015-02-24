$(function() {

	// Disable highlight text for all but inputs
	$('*:not(:input)').disableSelection();
	$('.cardDealt').hide();

	emitter.emit('start_game', ["deep"]);
	
	create_events();
	create_jquery_widgets();
	
	emitter.on('render_game', render_game);

	emitter.emit('render_game');

	function render_game(){
		console.log('begin render_game()');
		//removes all card divs
		$(".card").remove();
		console.log('    cards removed');
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
						$("#table").append(create_card(key, value.faceup)
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
		console.log('    cards created');
		make_cards_draggable();
		console.log('    cards functionality applied');
		console.log('begin render_game()');
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

				var card = $(ui.draggable).data('card');
				$(ui.draggable).css(position);  
				console.log('move_card(\''+card+'\', { left: '+percentLeft+'%, top: '+precentTop+'% })');
				emitter.emit('move_card', card, {x: percentLeft, y: precentTop, z: 0});
			}
		});
	}

	function create_events() {

		$('body').bind('contextmenu', function(){ return false });
			
		$("body").mousedown(function(event) {
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
		  console.log('end_turn()');
		  emitter.emit('end_turn');
		});
		$('.finish').click(function() {
			$.fn.jAlert({
				'title': 'Game Complete',
				'theme': 'success',
				'size': 'small',
				'btn': [{
					'label': 'Begin New Game',
					'cssClass': 'green',
					'onClick': function() {
						$.fn.jAlert({
							'title': 'Begin Game',
							'message': '#cards to be dealt',
							'theme': 'success',
							'size': 'small',
							'btn': [{
								'label': 'Shuffle and Deal',
								'cssClass': 'green',
								'onClick': function() {
									var text = prompt("Number of Cards to be Dealt", "0");
									console.log('deal_and_shuffle(' + text + ')');
									emitter.emit('deal_and_shuffle', text);
								}
							}, {
								'label': 'Deal',
								'cssClass': 'green',
								'onClick': function() {
									var text = prompt("Number of Cards to be Dealt", "0");
									console.log('deal(' + text + ')');
									emitter.emit('deal',text);
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
					},
				}, {
					'label': 'Return to Lobby',
					'cssClass': 'green',
					'onClick': function() {
						console.log('go_to_lobby()');
					}
				}],
				'closeBtn': false,
				'autofocus': 'btn:last'
			});
		});
	}
});
