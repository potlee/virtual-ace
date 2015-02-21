$(function() {
$('*:not(:input)').disableSelection();

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