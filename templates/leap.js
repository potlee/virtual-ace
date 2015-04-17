var LeapController = null;

$(function() {
	LeapController = new Leap.Controller({enableGestures: true});
	LeapController.streaming = false;


	LeapController.on('connect', function() {
		console.log("Successfully connected.");
	});

	LeapController.on('deviceStreaming', function() {
		LeapController.streaming = true;
		console.log("A Leap device has been connected.");
		createCanvas();
		createHands();
		var level = localStorage.getItem('leapLevel');
		
		console.log('level is: ' + level);
		
		if ( level == 3 ) { 
			LeapController.options = {
				sensitivity : {x: 0, y: 0}
			};
			
			LeapController.on('frame', level_3_frame);
		} else if (level == 2 ) {
			LeapController.options = {
				sensitivity : {x: 50, y: 50}
			};
			LeapController.on('frame', level_2_frame);
		} else {
			LeapController.options = {
				sensitivity : {x: 100, y: 90}
			};
			
			LeapController.on('frame', level_1_frame);
		}
	
		LeapController.on('gesture', onGesture);
		
		var initWidth = LeapController.ctx.canvas.clientWidth;
		var initHeight = LeapController.ctx.canvas.clientHeight;
		LeapController.screenTranslation = getTranslationVariables(initWidth, initHeight);
		

		LeapController.mousedown = false;
		LeapController.dragging = false;
		LeapController.hCard = null;
		LeapController.hEle = null;
		LeapController.color = 'red';
		LeapController.lastKeyTap = 0;
		LeapController.lastSwipe = 0;
	});

	LeapController.on('deviceStopped', function() {
		console.log("A Leap device has been disconnected.");
		LeapController.streaming = false;
	});

	LeapController.connect();

	function onGesture(gesture,frame) {
		if(gesture.type == "swipe" && gesture.state == "stop") {
			var msElapsed = Math.round(+new Date()) - LeapController.lastSwipe;
			
			var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
			if(msElapsed >= 1000) {
				LeapController.lastSwipe = Math.round(+new Date());
				//Classify as right-left or up-down
				if(isHorizontal){
					if(gesture.direction[0] > 0){
						swipeDirection = "right";
					} else {
						swipeDirection = "left";
					}
				} else { //vertical
					if(gesture.direction[1] > 0){
						handleVerticleSwipe("up");
					} else {
						handleVerticleSwipe("down");
					}                  
				}
				//console.log(swipeDirection);
			}
       } else if(gesture.type == "keyTap") {
			if(LeapController.hCard == null || LeapController.hCard === undefined) return;
			
			var msElapsed = Math.round(+new Date()) - LeapController.lastKeyTap;
			if(msElapsed >= 2000) {
				LeapController.lastKeyTap = Math.round(+new Date());
				// console.log('first click');
				return;
			} else if (msElapsed >= 100) { 
				// This is the 2nd keytap in less than 1 second
				// console.log('second click');
				flip_card(LeapController.hCard); //located in table.js
				LeapController.lastKeyTap = Math.round(+new Date())-10000;
			}
		}
	}
	
	function handleVerticleSwipe(direction) {
		if(!LeapController.updownswipeable) return;
		
		var input = $('.updownswipeable');
		var current_value = parseInt(input.val(),10);
		if(direction == "up") {
			input.val(current_value + 1);
		} else if (direction == "down") {
			input.val(current_value - 1);
		}
	}
	
	
	function getTranslationVariables(w, h) {
	
		var factor_x = 1 + 0.007 * LeapController.options.sensitivity.x;
		var factor_y = 1 + 0.007 * LeapController.options.sensitivity.y;
		
		var min_x = -200 / factor_x;
		var max_x = 170 / factor_x;
		
		var min_y = 350 / factor_y;
		var max_y = 100;
		
		var slope = w / (max_x - min_x);
		var b = -(slope * min_x);
		var x_ret = {'slope' : slope, 'b' : b };
		
		var slope = h / (max_y - min_y);
		var b = -(slope * min_y);
		var y_ret = {'slope' : slope, 'b' : b };
		
		
		return { 'x': x_ret, 'y': y_ret }
	}
	
	function getScreenTranslatedXY(position) {
		var x = LeapController.screenTranslation.x.slope * position[0] + LeapController.screenTranslation.x.b;
		var y = LeapController.screenTranslation.y.slope * position[1] + LeapController.screenTranslation.y.b;
		return {'x': x, 'y': y};
	}


	function level_3_frame(frame) {
		// Clear the canvas for redraw
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.clientWidth, LeapController.ctx.canvas.clientHeight);
		
		var hand = frame.hands[0];
		
		// There is atleast one hand in view
		if(hand === undefined) { return false; }

		var grabThreshold = 0.80;

		var position = hand.stabilizedPalmPosition;
		var palm = getScreenTranslatedXY(position);
		
		drawFinger(palm);

		var x = palm.x;
		var y = palm.y;
		
		handleMouseOver(x,y);
		
		if(LeapController.mousedown) {
			$(document).simulate("mousemove", {clientX: x, clientY: y});
		}
		
		if(hand.grabStrength > grabThreshold) {
			mouseDown(x,y);
		} else {
			mouseUp(x,y);
		}
	}
	
	function level_2_frame(frame) {
		// Clear the canvas for redraw
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.clientWidth, LeapController.ctx.canvas.clientHeight);
		
		var hand = frame.hands[0];
		
		// There is atleast one hand in view
		if(hand === undefined) { return false; }

		var pinchThreshold = 0.80;

		var position = hand.stabilizedPalmPosition;
		var palm = getScreenTranslatedXY(position);
		
		drawFinger(palm);

		var x = palm.x;
		var y = palm.y;


		handleMouseOver(x,y);
		
		if(LeapController.mousedown) {
			$(document).simulate("mousemove", {clientX: x, clientY: y});
		}
		
		if(hand.pinchStrength > pinchThreshold) {
			mouseDown(x,y);
		} else {
			mouseUp(x,y);
		}
	}


	function level_1_frame(frame) {
		// Clear the canvas for redraw
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.clientWidth, LeapController.ctx.canvas.clientHeight);
  
		var hand = frame.hands[0];
		var distanceThreshold = 60;
		
		// There is atleast one hand in view
		if(hand === undefined) { return false; }
		
		var position = hand.stabilizedPalmPosition;
		var palm = getScreenTranslatedXY(position);
		
		var position = hand.thumb.stabilizedTipPosition;
		var thumb = { x: position[0], y: position[1]};

		var position = hand.indexFinger.stabilizedTipPosition;
		var indexFinger = { x: position[0], y: position[1]};	
		
		drawFinger(palm);
		//drawFinger(getScreenTranslatedXY([thumb.x, thumb.y]));
		//drawFinger(getScreenTranslatedXY([indexFinger.x, indexFinger.y]));

        var distance = Leap.vec3.distance(hand.thumb.stabilizedTipPosition, hand.indexFinger.stabilizedTipPosition);
   
		var x = palm.x;
		var y = palm.y;
		
		if(LeapController.mousedown) {
			$(document).simulate("mousemove", {clientX: x, clientY: y});
		} else {
			handleMouseOver(x,y);
		}
		
		if(distance > distanceThreshold) {
			mouseUp(x,y);
		} else {
			mouseDown(x,y);
		}
	}

	function mouseDown(x,y) {
		if(LeapController.mousedown == true) return;
		$(LeapController.hEle).simulate("mousedown", {clientX: x, clientY: y});
		LeapController.mousedown = true;
		LeapController.color = 'green';
	}

	function mouseUp(x,y) {
		if(LeapController.mousedown == false) return;
		$(LeapController.hEle).simulate("mouseup", {clientX: x, clientY: y});
		$(LeapController.hEle).simulate("click", {clientX: x, clientY: y});
		LeapController.mousedown = false;
		LeapController.color = 'red';
	}	
	
	function drawFinger(position) {
		if(LeapController.mousedown) {
			LeapController.ctx.drawImage(LeapController.grabbingIcon,position.x-8, position.y-23);
		} else {
			LeapController.ctx.drawImage(LeapController.grabIcon,position.x-8, position.y-23);
		}
	}

	function drawPoint(position) {
		LeapController.ctx.beginPath();
		LeapController.ctx.rect(position.x-2, position.y+2, 4, 4);
		LeapController.ctx.fillStyle = LeapController.color;
		LeapController.ctx.fill();
	}

	function createHands() {		
		var i = document.createElement('img');
		document.body.appendChild(i);
		i.src='/grab.gif';
		i.id = 'grabIcon';
		i.style.display = 'none';

		var i2 = document.createElement('img');
		document.body.appendChild(i2);
		i2.src='/grabbing.gif';
		i2.id = 'grabIcon';
		i2.style.display = 'none';

		LeapController.grabIcon = i;
		LeapController.grabbingIcon = i2;
	}
	
	
	
	function createCanvas() {
		var c = document.createElement('canvas');
		document.body.appendChild(c);
		c.style.position = 'absolute';
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.zIndex = "100000000";
		c.style.width = "100%";
		c.style.height = "100%";
		c.style.pointerEvents = "none";
		c.width = c.offsetWidth;
		c.height = c.offsetHeight;
		c.id = 'leap-motion-canvas';
		
		
		LeapController.canvas = c;
		LeapController.ctx = LeapController.canvas.getContext("2d");
	}
	
	function handleMouseOver(x,y) {
	
	
		// Hiding canvas triggers mousemove on Chrome
		var w = LeapController.canvas.style.width;
		var h = LeapController.canvas.style.height;
		
		LeapController.canvas.style.width = '0';
		LeapController.canvas.style.height = '0';
		var el = document.elementFromPoint(x,y);
		LeapController.canvas.style.width = w;
		LeapController.canvas.style.height = h;
		
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
		
		if(el != LeapController.hEle) {
			// If a new elemnt is hovering then unhover card
			$(LeapController.hEle).removeClass('hover_effect');
			
			LeapController.hEle = el;
			$(LeapController.hEle).addClass('hover_effect');
			
			// Assume el is not a card
			LeapController.hCard = null;
			
			// if el is a card then set it as new card and do hover
			if(card) {
				LeapController.hCard = el;
			}
		}
	}
});