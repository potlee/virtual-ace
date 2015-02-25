


$(document).ready(function() {

//FOR TESTING PURPOSES SO THE CODE FUNCTIONS PROPERLY
//User = {
//  onlineUsers: function() {
//    return [
//      {
//        name: 'Kristen',
//        favoriteGames: ['solitair', 'rummy 500', 'poker', 'blackjack']
//      },
//      {
//        name: 'Kristen G',
//        favoriteGames: ['solitair', 'blackjack']
//      }
//    ];
//  },
//  create: function() {
//    return true;
//  },
//  currentUser: function() {
//    return {
//      name: 'user 1',
//      favoriteGames: ['game 1', 'game 2', 'game 3']
//    };
//  }
//};

	// Update username
	$("#login-form").submit(function(e) {
		e.preventDefault();
		var username = $(".username").val();
		if (username.length > 0) {
			// Do something with the username here
			window.location.href=$(this).attr("action");

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
      User.create(username, [], function() {
        window.location.href= '/lobby.html';
      });
		}
		else
		{
			$(".login-errors").html("Please enter a valid username");
		}
	});

	$("#favorite-game-form").submit(function(e) {
		e.preventDefault();
		var gameName = $(".add-favorite-game").val();
		if(gameName.length > 0) {
      emitter.emit('add_favorite_game', gameName);
			//User.currentUser.favoriteGames.push(gameName); //leave this code here for when the class is actually implemented
		}
		else
		{
			$(".favorite-game-errors").html("Please enter a valid game name");
		}
	});

	$("#level-form").submit(function(e) {
		e.preventDefault();
		var levelNumber;
		if ($('input[name=level-name]:checked').length > 0)
		{
			levelNumber = $('input[name=level-name]:checked').val();
		}

		window.levelNumber;

	});
  var	refreshLobby = function(){
		var $section = $(".users-online");
		$section.html('');
    Object.keys(User.onlineUsers()).forEach(function(username) {
      var games = '';
      if(User.onlineUsers()[username].favoriteGames)
        games = User.onlineUsers()[username].favoriteGames.join(',');
      if(games === '') games = "no favorite games :("
      $section.append("<li><input type='checkbox'>" +
                      username + ": " + games + "</li>");
    });
	};
  emitter.on('change_users', refreshLobby);

	var updateUsername = function()
	{
		var $section = $(".username-place-holder");
		$section.html('');
		$section.append("<p>" + User.currentUser() + "</p>");
	};
  emitter.on('change_users', updateUsername);

  var	insertFavoriteGames = function() {
    var $section = $(".games-available");
    $section.html('');
    var games = [];

    for(var user in User.onlineUsers()) {
      (User.onlineUsers()[user].favoriteGames||[]).forEach(function(game) {
        console.log(game);
        if(games.indexOf(game) == -1)
          games.push(game);
      });
    }
		for (var i = 0; i < games.length; i++) {
			$section.append("<li><input type='checkbox'>" + games[i] + "</li>");
		}
  };
  emitter.on('change_users', insertFavoriteGames);
});
