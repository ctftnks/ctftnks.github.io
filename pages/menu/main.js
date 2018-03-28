

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
