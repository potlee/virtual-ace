
        
        $(function() {
            $( ".hand" ).sortable({
                //revert: true
            });
            
 			//$( ".dealable li" ).draggable({
			// $( ".deck li" ).draggable({
//                 connectToSortable: ".hand",
//                 helper: "original",
//                 revert: "false",
//                 drag: function(){
//             		var offset = $(this).offset();
//             		var xPos = offset.left;
//             		var yPos = offset.top;
//             		console.log('x: ' + xPos);
//             		console.log('y: ' + yPos);
//        			 },
//        			stop: function(){
//             		var finalOffset = $(this).offset();
//             		var finalxPos = finalOffset.left;
//             		var finalyPos = finalOffset.top;
//             		console.log('Final X: ' + finalxPos);
//             		console.log('Final Y: ' + finalyPos);
//             		var this_class = $(this).attr("div");
//             		console.log($(this));
//             	}
//             });
            
            //  $( "li" ).draggable({
//                 connectToSortable: ".hand",
//                 //connectToSortable: ".table",
//                 helper: "original",
//                 revert: "false"
//             });

			var first = true;
			var xPos, yPos;

			$( "li" ).draggable({
                helper: "original",
                revert: "false",
				drag: function(){
            		var offset = $(this).offset();
            		var x = offset.left;
            		var y = offset.top;
            		if(first) { // beginning position of the card
            			first = false;
            			xPos = x;
            			yPos = y;
            		}
            		console.log('x: ' + x);
            		console.log('y: ' + y);
       			 },
       			stop: function(){
       				console.log('Begin X: ' + xPos);
            		console.log('Begin Y: ' + yPos);
       				first = true;
            		var finalOffset = $(this).offset();
            		var finalxPos = finalOffset.left;
            		var finalyPos = finalOffset.top;
            		console.log('Final X: ' + finalxPos);
            		console.log('Final Y: ' + finalyPos);
            		
            		// snap to hand
            		if(finalyPos > 415) {
            			console.log("snap hand");
            			$(this).addClass("ui-draggable-handle");
            			$(this).addClass("ui-sortable-handle");
            			$(this).removeAttr('style').css("position","relative");
            			var this_class = $(this).children();
            			//this_class = $(this).attr("div");
            			console.log(this_class);
 						$(this_class).removeClass("ui-draggable-handle");
            			$(".hand").append(this);
            			$( ".hand" ).sortable({});
            		}
            		
            		//snap to deck one
            		else if (finalyPos >= 30 && finalyPos <= 44 && 
            				 finalxPos >= 8 && finalxPos <= 32) {
            			$(this).removeAttr('style');
            			$(this).removeClass("ui-draggable-dragging");
            			$(".deck").append(this);
            			$(".one").append(this);
            			console.log("snap deck one");
            		}
            		
            		// snap to deck two
            		else if (finalyPos >= 183 && finalyPos <= 195 && 
            				 finalxPos >= 8 && finalxPos <= 32) {
            			$(this).removeAttr('style');
            			$(this).removeClass("ui-draggable-dragging");
            			$(".deck").append(this);
            			$(".two").append(this);
            			console.log("snap deck two");
            		}
            		
            		// free on table
            		else {
            			console.log("inside else");
            			// from deck one
            			if (yPos >= 30 && yPos <= 44 && 
            				 xPos >= 8 && xPos <= 32) {
            				//var victim_ul = document.getElementById('one');
            				//$(this).clone().insertAfter('.table .ui-draggable');
							//victim_ul.removeChild(this);
							
							// $('.one').each(function() {
//        					 	// save
//         					$a=$(this).children('li');
//         					// Move
//         					$($a.parent().parent()).after($a);
//         					// Delete
//         					$(this).remove();
//     						});
							
							// $(this).removeClass("deck");
// 							$(this).removeClass("one");
            				//$(".one").removeChild(this);
            				//$(this).appendTo('.table');
            				console.log("snap table from deck one");
            			}
            			// from deck two
            			else if (yPos >= 183 && yPos <= 195 && 
            				 xPos >= 8 && xPos <= 32) {
            				 
            			}
            			// from hand
            			else if(yPos > 415) {
            				console.log("from hand");
            				$(this).removeClass("ui-sortable-handle");
            				$(this).removeClass("ui-draggable-handle");
            				var this_class = $(this).children();
 							$(this_class).addClass("ui-draggable-handle");
 							//$(this).appendTo('.table');
 							
 							//
 							
 							
 							
 							
            			}
            			// from table
            			else{}
            		}
        		}
        	});
            
            $( "ul, li" ).disableSelection();
            
            
            $( "li" ).not('.ui-sortable-handle').draggable({ handle: "div" });

			$("div.card").mousedown(function(event) {
				switch (event.which) {
					case 2:
						//alert('Left Mouse button pressed.');
						break;
					case 1:
						//alert('Middle Mouse button pressed.');
						
						break;
					case 3:
						//alert('Right Mouse button pressed.');
						$(this).toggleClass("back");
						event.preventDefault();
						break;
						default:
						alert('You have a strange Mouse!');
				}
			});
			
        });