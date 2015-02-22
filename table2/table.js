$(function() {

// Disable highlight text for all but inputs
$('*:not(:input)').disableSelection();

// Make only droppable cards sortable because cards in hand
// because sortable when we run sortable()
$('.droppable .card').draggable({
    connectToSortable: '#hand',
    revert: 'invalid',
    stack: 'div',
    containment: '#bounds'
});


$("#hand").sortable({
	revert: 100,
    connectWith: '#hand, .droppable',
    containment: '#bounds',
    receive: function(event, ui) {
		var card = ui.item.data('card');
		console.log('move_card_to_hand(\''+card+'\')');
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
    }
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