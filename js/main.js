
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player(), new Player()];
  // game = newGame();
  // setTimeout(function(){game.pause();}, 1000);
  openMenu();
};

// start a new round
function newGame(){
  mode = new Deathmatch();
  game = new Game(canvas, mode);
  for(var i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  return game;
}

function addPlayer(bot=false){
  if(players.length >= keymaps.length)
    keymaps.push(keymaps[0].slice());
  if(bot)
    players.push(new Bot());
  else
    players.push(new Player());
  updateMenu();
}

function removePlayer(id){
  var newPlayers = [];
  for(var i=0; i<players.length; i++)
    if(players[i].id != id)
      newPlayers.push(players[i]);
  players = newPlayers;
  updateMenu();
}

function updateScores(){
  var scoreBoard = document.getElementById("scoreBoard");
  scoreBoard.innerHTML = "";

  players.sort(function(a, b){
    return a.score < b.score;
  } );

  for(var i=0; i<players.length; i++){
    var entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:"+players[i].color+";''>";
    entry += players[i].name;
    entry += "</span><span class='score'>";
    if(players[i].spree > 1)
      entry += " <span class='spree'>+"+players[i].spree+"</span>"
    entry += players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}


function openMenu(pause=false){
  if(pause)
    game.pause();
  document.getElementById("menu").style.display = "block";
  updateMenu();
}
function closeMenu(pause=true){
  // if(pause && game.paused)
  //   game.pause();
  document.getElementById("menu").style.display = "none";
}
function updateMenu(){
  var pmen = document.getElementById("playersMenu");
  playersMenu.innerHTML = "";
  var entry = "";
  entry += "<div class='entry'>";
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "<button class='name'>Name</button>";
  entry += editableKeymap(-1);
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "</div>";
  playersMenu.innerHTML += entry;
  for(var i=0; i<players.length; i++){
    var entry = "";
    var id = players[i].id;
    entry += "<div class='entry'>";
    entry += "<button class='team' onclick='players["+i+"].changeColor();updateMenu();' style='color:"+players[i].color+";'>&bull;</button>";
    entry += "<button class='name' onclick='editPlayerName("+i+")' style='color:"+players[i].color+";'>";
    entry += players[i].name;
    entry += "</button>";
    entry += editableKeymap(players[i].id);
    entry += "<button class='remove' onclick='removePlayer("+id+")'>&times;</button>";
    entry += "</div>";
    playersMenu.innerHTML += entry;
  }
}


function editPlayerName(index){
  players[index].name = prompt("Namen eingeben:");
  updateScores();
  updateMenu();
}
