


$(document).ready(function() {

//FOR TESTING PURPOSES SO THE CODE FUNCTIONS PROPERLY
User = {
  onlineUsers: function() {
    return [
      {
        name: 'Kristen',
        favoriteGames: ['solitair', 'rummy 500', 'poker', 'blackjack']
      },
      {
        name: 'Kristen G',
        favoriteGames: ['solitair', 'blackjack']
      }
    ];
  },
  create: function() {
    return true;
  },
  currentUser: function() {
    return {
      name: 'user 1',
      favoriteGames: ['game 1', 'game 2', 'game 3']
    };
  }
};


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
	
	$("#create-login-form").submit(function(e) {
		e.preventDefault();
		var username = $(".username").val();
		if (username.length > 0) {
		
			window.location.href=$(this).attr("action");
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

	function refreshLobby (){
		var $section = $(".users-online");

		$section.html('');
		var game = '	';
		for (var i = 0; i < User.onlineUsers().length; i++)
		{
			for (var j = 0; j < User.onlineUsers()[i].favoriteGames.length; j++)
			{
				game = game.concat(' ' + User.onlineUsers()[i].favoriteGames[j]);
				if ((j+1) < User.onlineUsers()[i].favoriteGames.length)
				{
					game = game.concat(',');
				}
			}
			$section.append("<li><input type='checkbox'>" + User.onlineUsers()[i].name + ": " + game + "</li>");  
			game = '';   
		}
		
	}

	function updateUsername()
	{
		var $section = $(".username-place-holder");
		$section.html('');
		$section.append("<p>" + User.currentUser().name + "</p>"); 
	}

	function insertFavoriteGames()
	{
		var $section = $(".games-available");
		$section.html('');
		var games = [];

		//$section.append("<li><input type='checkbox'>" + User.onlineUsers()[0].favoriteGames.length + "</li>");
		var counter = 0;
		for (var i = 0; i < User.onlineUsers().length; i++)
		{
			for (var j = 0; j < User.onlineUsers()[i].favoriteGames.length; j++)
			{
				games[counter] = User.onlineUsers()[i].favoriteGames[j];
				counter = counter + 1;
				
				

			}    
		}
		var length = games.length;
		counter = 0;
		for (var i = 0; i < games.length; i++)
		{
			
			for (var j = i; j < games.length - 1; j++)
			{
				if (games[i] === games[j + 1])
				{
					counter = counter + 1;
				}
			}
			
			games.splice(i, counter);
			if (counter >= 1)
			{
				i = i - 1;
			}
			counter = 0;


		 }
		 
		
		for (var i = 0; i < games.length; i++)
		{

			$section.append("<li><input type='checkbox'>" + games[i] + "</li>");
		}
	}

	insertFavoriteGames();
	updateUsername();
	refreshLobby();
	

});
