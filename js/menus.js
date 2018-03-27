
function openMenu(pause=false){
  if(pause)
    game.pause();
  document.getElementById("menu").style.display = "block";
  document.getElementById("closeframe").style.display = "block";
  updateMenu();
}
function closeMenu(pause=true){
  if(pause && typeof(game) !== "undefined" && game.paused)
    game.pause();
  document.getElementById("menu").style.display = "none";
  document.getElementById("closeframe").style.display = "none";
}
function updateMenu(){
  var pmen = document.getElementById("playersMenu");
  pmen.innerHTML = "";
  var entry = "";
  entry += "<div class='entry'>";
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "<button class='name'>Name</button>";
  entry += editableKeymap(-1);
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "</div>";
  pmen.innerHTML += entry;
  for(var i=0; i<players.length; i++){
    var entry = "";
    var id = players[i].id;
    entry += "<div class='entry'>";
    entry += "<button class='team' onclick='players["+i+"].changeColor();updateMenu();' style='color:"+players[i].color+";'>&#9899;</button>";
    entry += "<button class='name' onclick='editPlayerName("+i+")' style='color:"+players[i].color+";'>";
    entry += players[i].name;
    entry += "</button>";
    entry += editableKeymap(players[i].id);
    entry += "<button class='remove' onclick='removePlayer("+id+")'>&times;</button>";
    entry += "</div>";
    pmen.innerHTML += entry;
  }
}

function openWeaponMenu(){
  var wmen = document.getElementById("weaponMenu");
  wmen.style.display = "block";
  wmen.innerHTML = "<h2>Powerups:</h2>";
  var sel = "selected=\"selected\"";
  for(var i=0; i<PowerUps.length; i++){
    var name = PowerUps[i].name;
    var weight = PowerUps[i].weight;
    var entry = "";
    entry += "<div class='option'>";
    entry += "<span class='label powerupLabel'>"+name+"</span>";
    entry += "<select onchange=\"PowerUps["+i+"].weight=parseFloat(this.value)\">";
    entry += "<option value=\"0\" "+(weight == 0 ? sel : "")+">0%</option>";
    entry += "<option value=\"0.5\" "+(weight == 0.5 ? sel : "")+">50%</option>";
    entry += "<option value=\"1\" "+(weight == 1 ? sel : "")+">100%</option>";
    entry += "<option value=\"2\" "+(weight == 2 ? sel : "")+">200%</option>";
    entry += "</select></div>&nbsp;";
    wmen.innerHTML += entry;
  }
  var entry = "";
  entry += "<br /><br /><div class='option'>";
  entry += "<span class='label'>Rate</span>";
  entry += "<select onchange=\"PowerUpFrequency=parseFloat(this.value)*1000\">";
  entry += "<option value=\"2\">2s</option>";
  entry += "<option value=\"4\" selected=\"selected\">4s</option>";
  entry += "<option value=\"4\">6s</option>";
  entry += "<option value=\"10\">10s</option>";
  entry += "</select></div>&nbsp;&nbsp;&nbsp;";
  wmen.innerHTML += entry;
  var entry = "";
  entry += "<div class='option'>";
  entry += "<span class='label'>Amount</span>";
  entry += "<select onchange=\"MaxPowerUps=parseInt(this.value)\">";
  entry += "<option value=\"2\">2</option>";
  entry += "<option value=\"4\">4</option>";
  entry += "<option value=\"8\" selected=\"selected\">8</option>";
  entry += "<option value=\"16\">16</option>";
  entry += "<option value=\"32\">32</option>";
  entry += "</select></div>&nbsp;&nbsp;&nbsp;";
  wmen.innerHTML += entry;

  wmen.innerHTML += "<button onclick=\"closeWeaponMenu();\">Close</button><br /><br /><br />";
}

function closeWeaponMenu(){
  document.getElementById("weaponMenu").style.display = "none";
}


function editPlayerName(index){
  players[index].name = prompt("Namen eingeben:");
  updateScores();
  updateMenu();
}
