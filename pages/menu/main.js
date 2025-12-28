function addPlayer(bot = false) {
  if (players.length >= keymaps.length) keymaps.push(keymaps[0].slice());
  if (bot) players.push(new Bot());
  else players.push(new Player());
  updatePlayersMenu();
}

function removePlayer(id) {
  var newPlayers = [];
  for (var i = 0; i < players.length; i++) if (players[i].id != id) newPlayers.push(players[i]);
  players = newPlayers;
  updatePlayersMenu();
}

function updatePlayersMenu() {
  var pmen = document.getElementById("playersMenu");
  pmen.innerHTML = "";
  var entry = "";
  entry += "<div class='entry'>";
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "<button class='name notclickable'>Name</button>";
  entry += editableKeymap(-1);
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "</div>";
  pmen.innerHTML += entry;
  for (var i = 0; i < players.length; i++) {
    var entry = "";
    var id = players[i].id;
    entry += "<div class='entry'>";
    entry +=
      "<button class='team' onclick='players[" +
      i +
      "].changeColor();updatePlayersMenu();' style='color:" +
      players[i].color +
      ";'>&diams;</button>";
    entry += "<button class='name' onclick='editPlayerName(" + i + ")' style='color:" + players[i].color + ";'>";
    entry += players[i].name;
    entry += "</button>";
    if (players[i].isBot) entry += editableKeymap(-2);
    else entry += editableKeymap(players[i].id);
    entry += "<button class='remove' onclick='removePlayer(" + id + ")'>&times;</button>";
    entry += "</div>";
    pmen.innerHTML += entry;
  }
  updateScores();
}

// edit the keymap from the menu
function editableKeymap(mapID) {
  if (mapID == -1) {
    var html = "";
    html += "<button class='keyEditButton notclickable'>&uarr;</button>";
    html += "<button class='keyEditButton notclickable'>&larr;</button>";
    html += "<button class='keyEditButton notclickable'>&darr;</button>";
    html += "<button class='keyEditButton notclickable'>&rarr;</button>";
    html += "<button class='keyEditButton notclickable'>Fire</button>";
    return html;
  }
  if (mapID == -2) {
    var html = "";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    return html;
  }
  var html = "";
  for (var i in keymaps[mapID]) {
    html += "<button class='keyEditButton' onclick='editKeymap(" + mapID + ", " + i + ")' onfocusout='editingKeymap=false'>";
    html += keyLabels[keymaps[mapID][i]];
    html += "</button>";
  }
  return html;
}

editingKeymap = false;
editingMapID = -1;
editingKeyID = -1;
function editKeymap(mapID, keyID) {
  editingKeymap = true;
  editingMapID = mapID;
  editingKeyID = keyID;
}
function doEditKeymap(newKeyCode) {
  keymaps[editingMapID][editingKeyID] = newKeyCode;
  editingKeymap = false;
  updatePlayersMenu();
}

function editPlayerName(index) {
  var name = prompt("Namen eingeben:");
  if (name != null) players[index].name = name;
  updatePlayersMenu();
}
