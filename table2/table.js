$(function() {
$('*:not(:input)').disableSelection();

render_game("user1");

			//Takes in a json file and recreats all the cards.
			//--Need to figure out where the file is coming from
			function render_game(user/*, game_state*/){
			//removes all card divs
			$(".card").remove();
			
			//var game = JSON.parse(game_state);
			var game_state = {
				turn: 'user1',
				users: ['user1','user2','...'],
				cards: {
					'AS': {
						position: {
							x: 100,
							y: 100,
							z: 0
						},
						username: 'user1', // or 'table'
						faceup: true // or false
					},
					'AH': {
						position: {
							x: 200,
							y: 100,
							z: 2
						},
						username: 'table', // or 'table'
						faceup: true // or false
					},
					'AC': {
						position: {
							x: 250,
							y: 100,
							z: 1
						},
						username: 'table', // or 'table'
						faceup: true // or false
					},
					'AD': {
						position: {
							x: 225,
							y: 125,
							z: 3
						},
						username: 'table', // or 'table'
						faceup: true // or false
					}
				},
				game: 'game 1'
			}; 
			
			//go through each card and create them.
			
			//=== does not change data types of either side
			//-- Currently only distinguishes between hand and table, ownership
			//-- should be implemented later (create ownership id by username, then
			//--(#'username').append( )etc.)
			$.each(game_state.cards, function(key, value){
			//do checks for users/table or hand checks here.
				switch (value.username){
					case user:
							$("#hand").append(create_card(key, value.faceup));
							break;
						
					case "table":
							$("#table").append(create_card(key, value.faceup)
												.css({"top" : value.position.y,
													"left" : value.position.x, 
													"z-index" : value.position.z})
							);
							break;
					default:
							//The case where someone else owns the card, may have to
							//consider ownership boxes later but right now don't render the card.
							//keep count of cards in the users hands.
				}
				
			});
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
		
		
		
		
		


$("#hand").sortable({
	revert: 100,
    connectWith: '#hand, .droppable',
    containment: '#bounds',
    receive: function(event, ui) {
		console.log('move_card_to_hand(card)');
    },
    beforeStop: function (event, ui) {
        ui.item.css('position', 'relative');
    }
});

$(".droppable").droppable({
	tolerance: "intersect",
    drop: function (ev, ui) {
        //if(ui.draggable.parent().hasClass('ui-sortable')) {
            var clone = ui.draggable.clone();
            ui.draggable.remove();
            $(this).append(clone);
            $(clone).draggable({
				connectToSortable: '#hand',
				revert: 'invalid',
				stack: 'div',
				containment: '#bounds'

            });
       // }

/*
		var re = /rank\-(.)/; 
		var str = $(clone).attr('class');
		var m;
		 
		while ((m = re.exec(str)) != null) {
			if (m.index === re.lastIndex) {
				re.lastIndex++;
			}
		}


*/
       console.log('move_card(card, location)');

    }
});


$('.card').draggable({
    connectToSortable: '#hand',
    revert: 'invalid',
    stack: 'div',
    containment: '#bounds'
});


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
						event.preventDefault();
						break;
					default:
						alert('You have a strange Mouse!');
				}
			});
		
});