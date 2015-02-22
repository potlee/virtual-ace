$(function() {
	var LeapController = new Leap.Controller();


	LeapController.on('connect', function() {
		console.log("Successfully connected.");
	});

	LeapController.on('deviceStreaming', function() {
		console.log("A Leap device has been connected.");
		createCanvas();
		
		var level = 1;
		
		if( level == 1) {
			LeapController.options = {
				sensitivity : {x: 100, y: 90}
			};
			
			LeapController.on('frame', level_1_frame);
		
		} else if (level == 2) {
			LeapController.options = {
				sensitivity : {x: 50, y: 50}
			};
			
			LeapController.on('frame', level_2_frame);
		} else { 
			LeapController.options = {
				sensitivity : {x: 0, y: 0}
			};
			
			LeapController.on('frame', level_3_frame);
		}

		
		var initWidth = LeapController.ctx.canvas.width;
		var initHeight = LeapController.ctx.canvas.height;
		LeapController.screenTranslation = getTranslationVariables(initWidth, initHeight);
		

		LeapController.mousedown = false;
		LeapController.dragging = false;
		LeapController.hCard = null;
		LeapController.hEle = null;
		LeapController.color = 'red';
	});

	LeapController.on('deviceStopped', function() {
		console.log("A Leap device has been disconnected.");
	});

	LeapController.connect();

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
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.width, LeapController.ctx.canvas.height);
		
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
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.width, LeapController.ctx.canvas.height);
		
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
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.width, LeapController.ctx.canvas.height);
		
		var hand = frame.hands[0];
		var distanceThreshold = 27;
		
		// There is atleast one hand in view
		if(hand === undefined) { return false; }
		
		
		var palmAdjustment = { x: -15, y: -30 };
		if(hand.type == 'left') {
			palmAdjustment.x = -palmAdjustment.x;
		}
		
		var position = hand.indexFinger.stabilizedTipPosition;
		var indexFinger = getScreenTranslatedXY(position);
		
		var position = hand.thumb.stabilizedTipPosition;
		var thumb = { x: position[0], y: position[1]};
		
		var position = hand.stabilizedPalmPosition;
		var palm = { x: position[0] + palmAdjustment.x, y: position[1] +  palmAdjustment.y};
		
		drawFinger(indexFinger);
		drawFinger(getScreenTranslatedXY([thumb.x, thumb.y]));
		drawFinger(getScreenTranslatedXY([palm.x, palm.y]));
		
		var distance;
		
		if(hand.type == 'left') {
			distance = thumb.x - palm.x;
		} else {
			distance = palm.x - thumb.x;
		}
		
		var x = indexFinger.x;
		var y = indexFinger.y;
		
		if(LeapController.mousedown) {
			$(document).simulate("mousemove", {clientX: x, clientY: y});
		} else {
			handleMouseOver(x,y);
		}
		
		if(distance > distanceThreshold) {
			mouseDown(x,y);
		} else {
			mouseUp(x,y);
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
		LeapController.mousedown = false;
		LeapController.color = 'red';
	}	
	
	function drawFinger(position) {
		LeapController.ctx.beginPath();
		LeapController.ctx.rect(position.x, position.y, 20, 20);
		LeapController.ctx.fillStyle = LeapController.color;
		LeapController.ctx.fill();
	}


	function createCanvas() {
		var c = document.createElement('canvas');
		document.body.appendChild(c);
		c.style.position = 'absolute';
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.zIndex = "1000000";
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