
function openMenu(pause=false){
  if(pause)
    game.pause();
  var id = openScreen(mainMenu);
  document.querySelector("#screen"+id+" .closeframe").onclick = function(){closeMenu(true)};
  updateMenu();
}
function closeMenu(pause=true){
  if(pause && typeof(game) !== "undefined" && game.paused)
    game.pause();
  var elem = document.getElementById("menu");
  elem.parentNode.parentNode.removeChild(elem.parentNode);
}



function mainMenu(){
  var content = `
    <div id="menu">
      <h1>AZ Tank Game</h1>

      <div id="options">
        <div class="option">
          <span class="label">Mode</span>
          <select onchange="GameMode=this.value">
            <option value="DM">DM</option>
            <option value="TDM">TDM</option>
            <option value="CTF">CTF</option>
          </select>
        </div>
        <div class="option">
          <span class="label">Sound</span>
          <select onchange="muted=this.value!='on'">
            <option value="on">on</option>
            <option value="off">off</option>
          </select>
        </div>
        <div class="option">
          <span class="label">Friendly Fire</span>
          <select onchange="FriendlyFire=this.value=='on'">
            <option value="on">on</option>
            <option value="off">off</option>
          </select>
        </div>
        <div class="option">
          <span class="label">Bots</span>
          <select onchange="BotSpeed=parseFloat(this.value)">
            <option value="0.6" selected="selected">Lame</option>
            <option value="0.8" selected="selected">Ok</option>
            <option value="1" selected="selected">Decent</option>
            <option value="1.2">Quick</option>
            <option value="1.4">Pro</option>
            <option value="1.8">Insane</option>
          </select>
        </div>
      </div>
      <br />


      <div id="playersMenu">

      </div>
      <br><br>
      <button onclick="addPlayer(true);">Add Bot</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button onclick="addPlayer();">Add Player</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button onclick="openScreen(powerupMenu);">Powerups..</button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <button onclick="closeMenu();newGame();">Start Game</button>
      <br><br><br>
    </div>
  `;
  return content;
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

// edit the keymap from the menu
function editableKeymap(mapID){
  if(mapID==-1){
    var html = "";
    html += "<button class='keyEditButton'>&uarr;</button>";
    html += "<button class='keyEditButton'>&larr;</button>";
    html += "<button class='keyEditButton'>&darr;</button>";
    html += "<button class='keyEditButton'>&rarr;</button>";
    html += "<button class='keyEditButton'>Fire</button>";
    return html
  }
  var html = "";
  for(var i in keymaps[mapID]){
    html += "<button class='keyEditButton clickable' onclick='editKeymap("+mapID+", "+i+")' onfocusout='editingKeymap=false'>";
    html += keyLabels[keymaps[mapID][i]];
    html += "</button>";
  }
  return html;
}

editingKeymap = false;
editingMapID = -1;
editingKeyID = -1;
function editKeymap(mapID, keyID){
  editingKeymap = true;
  editingMapID = mapID;
  editingKeyID = keyID;
}
function doEditKeymap(newKeyCode){
  keymaps[editingMapID][editingKeyID] = newKeyCode;
  editingKeymap = false;
  updateMenu();
}

function editPlayerName(index){
  players[index].name = prompt("Namen eingeben:");
  updateScores();
  updateMenu();
}
