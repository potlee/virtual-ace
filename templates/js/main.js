

$(document).ready(function() {
	// Update username

	var checkedUsernames 
	$("#login-form").submit(function(e) {
		window.levelNumber = 1;
		e.preventDefault();
		var username = $(".username").val();
		if (username.length > 0) {
			try {
      			User.login(username);
      			window.location.href=$(this).attr("action");
      		}
      		catch (err)
      		{
      			$(".login-errors").html("This username does not exist");
      		}
		
			

		}
		else
		{
			$(".login-errors").html("Please enter a valid username");
		}


	});

	//document.querySelector('.begin-game').onclick = function() {

	//}

	$("#create-login-form").submit(function(e) {
		e.preventDefault();
		var username = $(".username").val();
		if (username.length > 0) {
			try {
      			User.create(username, [], function() {
       	 			window.location.href= '/lobby.html';
      			});
      		}
      		catch (err)
      		{
      			$(".login-errors").html("This username already exists");
      		}

		}
		else
		{
			$(".login-errors").html("Please enter a valid username");
		}
	});

	$("#favorite-game-form").submit(function(e) {
		e.preventDefault();
		var gameName = $(".add-favorite-game").val();
		var doesntExist = true;
		if(gameName.length > 0) {
			(User.onlineUsers()[User.currentUser()].favoriteGames||[]).forEach(function(game) {
				console.log(gameName);
    				console.log(game);
    			if (game === gameName)
    			{
    				
    				$(".favorite-game-errors").html("Please enter a valid game name");
    				doesntExist = false;
    			}

      		});
			if (doesntExist === true)
			{
				emitter.emit('add_favorite_game', gameName);
			}
		
			
		}
		else
		{
			$(".favorite-game-errors").html("Please enter a valid game name");
		}
	});

	$("#begin-game").click(function(e) {
		e.preventDefault();
		var inviteUsers = [];
		var gameName;
		[].forEach.call(document.querySelectorAll('.user'), function(user) {
			if(user.checked) {
				inviteUsers.push(user.getAttribute('name'));

				console.log(user.getAttribute('name'));
			}
		});
		[].forEach.call(document.querySelectorAll('.game-name'), function(user) {
			if(user.checked) {
				gameName = user.getAttribute('game-name');
			}
		});
		//console.log(inviteUsers);
		if(gameName)
		{

			emitter.emit("start_new_game", inviteUsers, gameName);
		}
      	else 
      	{
      		$(".choose-game-errors").html("Please choose a game");
      	}	
      	

      	
      		
      	
		
	});

	$("#level-form").submit(function(e) {
		e.preventDefault();
		if ($('input[name=level-name]:checked').length > 0)
		{
			window.levelNumber = $('input[name=level-name]:checked').val();
		}
		window.location.href='lobby.html';
		localStorage.setItem("leapLevel", levelNumber);
		
	});
  var refreshLobby = function() {
  		var $section = $(".current-level");
  		$section.html('');
  		$section.append('<div class="current-level">Level ' + localStorage.getItem("leapLevel") + '</div>');
		var $section = $(".users-online");
		$section.html('');
    	Object.keys(User.onlineUsers()).forEach(function(username) {
     		 var games = '';
      		if(User.onlineUsers()[username].favoriteGames)
       		 games = User.onlineUsers()[username].favoriteGames.join(', ');
      		if(games === '') games = "no favorite games :("
      		if (username === User.currentUser())
      		{
      			$(".my-favorite-game-list").html('');
                $(".my-favorite-game-list").append("<p> My Favorite Games: " + games + "</p>");
      		}
      		if (username != User.currentUser())
      		{
      			$section.append(  '<li>' + '<input type="checkbox" style="display:none" id="' + username + '" class="user" name="' + 
      				username + '">' + '<label class="online-users-checkbox" for="' + username + '"></label> ' + 
                    username + ": " + games + '</li> ');

      		}
    	})

	};
    emitter.on('change_users', refreshLobby);

	var updateUsername = function()
	{
		var $section = $(".username-place-holder");
		$section.html('');
		$section.append('<p class="username-place-holder">' + User.currentUser() + "</p>");
	};

  emitter.on('change_users', updateUsername);

  var	insertFavoriteGames = function() {
    var $section = $(".games-available");
    $section.html('');
    var games = [];

    for(var user in User.onlineUsers()) {
      (User.onlineUsers()[user].favoriteGames||[]).forEach(function(game) {
        
        if(games.indexOf(game) == -1)
          games.push(game);
      });
    }
		for (var i = 0; i < games.length; i++) {
			$section.append('<li><input type="radio" name="games-list" style="display:none" class="game-name" id="' + games[i] + '" game-name=' +  games[i] + '>' + '<label class="online-users-checkbox" for="' + games[i] + '"></label> ' + games[i] + "</li>");
		}
  };
  emitter.on('change_users', insertFavoriteGames);
  function BrowserDetection() {      
                //Check if browser is IE or not
                
                if (navigator.userAgent.search("Chrome") < 0) {
                	console.log("Browser Detection");
                    $(".browser-error").html("The application requires Google Chrome");
                   
                }

    };
    BrowserDetection();

});
