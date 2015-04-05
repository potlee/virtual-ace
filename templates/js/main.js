

$(document).ready(function() {

  $("#login-form").submit(function(e) {
    e.preventDefault();
    var username = $(".username").val();
    if (username.length > 0) {
      try  {
        User.login(username);
        window.location.href=$(this).attr("action");
      }
      catch (err)  {
        $(".login-errors").html("This username does not exist");
      }
    }
    else  {
      $(".login-errors").html("Please enter a valid username");
    }
  });


  $("#logout-id").click(function(e) {
    e.preventDefault();
    emitter.emit("logout");
    window.location.href=$(this).attr("action");
  });


  $("#create-login-form").submit(function(e) {
    e.preventDefault();
    var username = $(".username").val();
    if (username.length > 0)  {
      try {
        User.create(username, [], function() {
          window.location.href= '/lobby.html';
        });
      }
      catch (err)  {
        $(".login-errors").html("This username already exists");
      }
    }
    else  {
			$(".login-errors").html("Please enter a valid username");
    }
  });


  $("#add-game-form").submit(function(e) {
    e.preventDefault();
    var gameName = $(".add-name").val().split(" ").join("_");
    var doesntExist = true;
    if(gameName.length > 0) {
      (User.onlineUsers()[User.currentUser()].favoriteGames||[]).forEach(function(game) {
        if (game === gameName)  {
          $(".favorite-game-errors").html("Please enter a valid game name");
          doesntExist = false;
        }
      });
      if (doesntExist === true)  {
        emitter.emit('add_favorite_game', gameName);
      }
    }
    else  {
      $(".favorite-game-errors").html("Please enter a valid game name");
    }
    renderFavoriteGamesPage();
    console.log("yo");
    $section = $(".add-name");
    $section.val("");
   // $section.append('<input class="add-name" type="text" placeholder="Favorite Game">');
  });


  $("#begin-game").click(function(e) {
    e.preventDefault();
    var inviteUsers = [];
    var gameName;
    [].forEach.call(document.querySelectorAll('.user'), function(user) {
      if(user.checked) {
        inviteUsers.push(user.getAttribute('name'));
      }
    });
    [].forEach.call(document.querySelectorAll('.game-name'), function(user) {
      if(user.checked) {
        gameName = user.getAttribute('game-name');
      }
    });
    if(gameName)  {
      emitter.emit("start_new_game", inviteUsers, gameName);
    }
    else  {
      $(".choose-game-errors").html("Please choose a game");
    }	
  });


  $("#level-form").submit(function(e) {
    e.preventDefault();
    if ($('input[name=level-name]:checked').length > 0)  {
      window.levelNumber = $('input[name=level-name]:checked').val();
    }
    window.location.href='lobby.html';
    localStorage.setItem("leapLevel", levelNumber);
		
  });

  $("#delete-favorite-games-id").click(function(e)  {
  	e.preventDefault;
  	var gameCheckBoxes = $(".delete-favorite-game-class");
  	var gameNamesChecked = [];
  	for (var i = 0; i < gameCheckBoxes.length; i++)  {
  	  if ($(gameCheckBoxes[i]).prop("checked")) {
  	  	gameNamesChecked.push(gameCheckBoxes[i].id);
  	  }
  	}
  	for (var i = 0; i < gameNamesChecked.length; i++)  {
  		 emitter.emit("remove_favorite_game", gameNamesChecked[i]);
  	}
  	renderFavoriteGamesPage([]);
  });


  var renderFavoriteGamesPage = function(deleteGames) {
    var $section = $(".my-favorite-games-list");
    $section.html('');
    for(var user in User.onlineUsers()) {
      if (user === User.currentUser())  {
        (User.onlineUsers()[User.currentUser()].favoriteGames||[]).forEach(function(game) {
          if ($.inArray(game, deleteGames) === -1)  {
            $section.append('<li><input id="' + game + '"  name="' + game + '"' +
          	  'type="checkbox" class="delete-favorite-game-class" style="display:none"> <label class="favorite-game-checkbox"  for="' + game + '">' + game.split("_").join(" ") + '</label></li>');
          }
          else {
          	$section.append('<li><input id="' + game + '"  name="' + game + '"' +
          	  'type="checkbox" checked class="delete-favorite-game-class" style="display:none"> <label class="favorite-game-checkbox"  for="' + game + '">' + game.split("_").join(" ") + '</label></li>');
          }
        });
      }
    }
  };

  

  var refreshLobby = function(invitedUsers) {
    var $section = $(".current-level");
    $section.html('');
    var leapLevel = localStorage.getItem("leapLevel");
    if (leapLevel != null)  {
      $section.append('<div class="current-level">Level ' + localStorage.getItem("leapLevel") + '</div>');
    }
    else  {
      $section.append('<div class="current-level">Level ' + 1 + '</div>');
      localStorage.leapLevel = 1;
    }
    var $section = $(".users-online");
    $section.html('');
    Object.keys(User.onlineUsers()).forEach(function(username) {
    var usersGames = '';
    if(User.onlineUsers()[username].favoriteGames)
      usersGames = User.onlineUsers()[username].favoriteGames.join(', ');
      if(usersGames === '') usersGames = "no favorite games :("
      if (username === User.currentUser()) {
        $(".my-favorite-game-list").html('');
        $(".my-favorite-game-list").append("<p> My Favorite Games: " + usersGames.split("_").join(" ") + "</p>");
      }
      if (username != User.currentUser())  {
      	if ($.inArray(username, invitedUsers) === -1)  {
      	  $section.append(  '<li>' + '<input type="checkbox" style="display:none" id="' + username + '" class="user" name="' + 
            username + '">' + '<label class="online-users-checkbox" for="' + username + '"></label> ' + 
            username + ": " + usersGames + '</li> ');	
      	}
        else  {
          $section.append(  '<li>' + '<input checked type="checkbox" style="display:none" id="' + username + '" class="user" name="' + 
            username + '">' + '<label class="online-users-checkbox" for="' + username + '"></label> ' + 
            username + ": " + usersGames + '</li> ');
        }
      }
    })

  };


  var updateUsername = function()  {
    var $section = $(".username-place-holder");
    $section.html('');
    $section.append('<p class="username-place-holder">' + User.currentUser() + "</p>");
    // If in lobby and username is null, redirect them to login page
    if(window.location.pathname == '/lobby.html' && User.currentUser() == 'null') {
		location.href = '/index.html';
    }
  };


  var insertFavoriteGames = function(gameName) {
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
      if (games[i] != gameName)  {
        $section.append('<li><input type="radio" name="games-list" style="display:none" class="game-name" id="' + games[i] + '" game-name=' +  
           games[i] + '>' + '<label class="online-users-checkbox" for="' + games[i] + '"></label> ' + games[i].split("_").join(" ") + "</li>");
      }
      else  {		
        $section.append('<li><input type="radio" checked name="games-list" style="display:none" class="game-name" id="' + games[i] + '" game-name=' +  
        games[i] + '>' + '<label class="online-users-checkbox" for="' + games[i] + '"></label> ' + games[i].split("_").join(" ") + "</li>");
      }
    }
  };


  var onChangeUsers = function() {
    var invitedUsers = [];
    var gameName = "";
    var gamesCheckedDelete = $(".delete-favorite-game-class");
  	var deleteGameNamesChecked = [];
  	for (var i = 0; i < gamesCheckedDelete.length; i++)  {
      if ($(gamesCheckedDelete[i]).prop("checked")) {
  	  	deleteGameNamesChecked.push(gamesCheckedDelete[i].id);
  	  }
  	}
    [].forEach.call(document.querySelectorAll('.user'), function(user) {
      if(user.checked) {
        invitedUsers.push(user.getAttribute('name'));
      }
    });
    [].forEach.call(document.querySelectorAll('.game-name'), function(user) {	
      if(user.checked) {
        gameName = user.getAttribute('game-name');
      }
    });
    gameName.split(" ").join("_");
    refreshLobby(invitedUsers);
    updateUsername();
    insertFavoriteGames(gameName);
    renderFavoriteGamesPage(deleteGameNamesChecked);
  }

  emitter.on('change_users', onChangeUsers);

  function BrowserDetection() {                    
    if (navigator.userAgent.search("Chrome") < 0) {
      $(".browser-error").html("The application requires Google Chrome");             
    }

  };

  BrowserDetection();
  renderFavoriteGamesPage();

});
