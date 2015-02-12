$(function() {
	var LeapController = new Leap.Controller();

	LeapController.on('connect', function() {
	  console.log("Successfully connected.");
	});

	LeapController.on('deviceStreaming', function() {
		console.log("A Leap device has been connected.");
		createCanvas();
	});

	LeapController.on('deviceStopped', function() {
	  console.log("A Leap device has been disconnected.");
	});

	LeapController.connect();
	LeapController.on('frame', onFrame);

	LeapController.mousedown = false;
	LeapController.dragging = false;
            
	function onFrame(frame) {
		// Clear the canvas for redraw
		LeapController.ctx.clearRect(0, 0, LeapController.ctx.canvas.width, LeapController.ctx.canvas.height);
		
		var hand = frame.hands[0];
		

		// There is atleast one hand in view
		if(hand === undefined) { return false; }
		
		
		var palmAdjustment = { x: -120, y: 100 };
		if(hand.type == 'left') {
			palmAdjustment.x = 120;
		}
		
		var indexFinger = { x: 0, y: 0 };
		var thumb = { x: 0, y: 0 };
		var palm = { x: 0, y: 0 };
		
		var position = hand.indexFinger.stabilizedTipPosition;
		indexFinger.x = LeapController.ctx.canvas.width/4 + 6*position[0];
		indexFinger.y = LeapController.ctx.canvas.height - 4*position[1] + 500;
		
		var position = hand.thumb.stabilizedTipPosition;
		thumb.x = LeapController.ctx.canvas.width/4 + 6*position[0];
		thumb.y = LeapController.ctx.canvas.height - 4*position[1] + 500;
		
		var position = hand.stabilizedPalmPosition;
		palm.x = LeapController.ctx.canvas.width/4 + 6*position[0] + palmAdjustment.x;
		palm.y = LeapController.ctx.canvas.height - 4*position[1] + 500 + palmAdjustment.y;
		
		drawFinger(indexFinger);
		//drawFinger(thumb);
		//drawFinger(palm);
		
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
		}
		
		if(distance > 200 && LeapController.mousedown == false) {
			LeapController.canvas.style.display = 'none';
			var el = document.elementFromPoint(x,y);
			$(el).simulate("mousedown", {clientX: x, clientY: y});
			//LeapController.canvas.style.display = 'block';
			console.log('mouse down');
			LeapController.mousedown = true;
		} else if (distance <= 200 && LeapController.mousedown == true) {
			console.log('mouse up');
			var el = document.elementFromPoint(x,y);
			LeapController.canvas.style.display = 'block';
			$(el).simulate("mouseup", {clientX: x, clientY: y});
			LeapController.mousedown = false;
		}
	}


	function drawFinger(position) {
		LeapController.ctx.beginPath();
		LeapController.ctx.rect(position.x, position.y, 20, 20);
		LeapController.ctx.fillStyle = 'red';
		LeapController.ctx.fill();
	}


	function createCanvas() {
		var c = document.createElement('canvas');
		document.body.appendChild(c);
		c.style.position = 'absolute';
		c.style.left = "0px";
		c.style.top = "0px";
		c.style.zIndex = "100";
		c.style.width = "100%";
		c.style.height = "100%";
		c.width = c.offsetWidth;
		c.height = c.offsetHeight;
		c.id = 'leap-motion-canvas';
		LeapController.canvas = c;
		LeapController.ctx = LeapController.canvas.getContext("2d");
	}
});