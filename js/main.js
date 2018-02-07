
// generate canvas object and players list
window.onload = function(){
  canvas = new Canvas("gameFrame");
  players = [new Player(), new Player()];
  game = newGame();
  // setTimeout(function(){game.pause();}, 1000);
  // openMenu();
};

// start a new round
function newGame(){
  game = new Game(canvas);
  for(var i=0; i<players.length; i++)
    game.addPlayer(players[i]);
  game.start();
  canvas.sync();
  return game;
}

function addPlayer(){
  if(players.length >= keymaps.length){
    keymaps.push(keymaps[0].slice());
    console.log("asfs");
  }
  players.push(new Player());
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
    entry += players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}


function openMenu(){
  game.pause();
  document.getElementById("menu").style.display = "block";
  updateMenu();
}
function closeMenu(){
  if(game.paused)
    game.start();
  document.getElementById("menu").style.display = "none";
}
function updateMenu(){
  var pmen = document.getElementById("playersMenu");
  playersMenu.innerHTML = "";
  var entry = "";
  entry += "<div class='entry'>";
  entry += "<button class='name'>Name</button>";
  entry += editableKeymap(-1);
  entry += "<br></div>";
  playersMenu.innerHTML += entry;
  for(var i=0; i<players.length; i++){
    var entry = "";
    entry += "<div class='entry'>";
    entry += "<button class='name' onclick='editPlayerName("+i+")' style='color:"+players[i].color+";''>";
    entry += players[i].name;
    entry += "</button>";
    entry += editableKeymap(players[i].id);
    entry += "</div>";
    playersMenu.innerHTML += entry;
  }
}


function editPlayerName(playerID){
  players[playerID].name = prompt("Namen eingeben:");
  updateScores();
  updateMenu();
}
