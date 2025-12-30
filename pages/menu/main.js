import template from "./main.html?raw";
import "./style.css";
import Bot from "../../js/classes/bot.js";
import Player from "../../js/classes/player.js";
import { updateScores } from "../../js/main.js";

export function init(container) {
  container.innerHTML = template;
  updatePlayersMenu();
  if (typeof game !== "undefined") game.paused = true;
}

function addPlayer(bot = false) {
  if (players.length >= keymaps.length) keymaps.push(keymaps[0].slice());
  if (bot) players.push(new Bot());
  else players.push(new Player());
  updatePlayersMenu();
}

function removePlayer(id) {
  const newPlayers = [];
  for (let i = 0; i < players.length; i++) if (players[i].id !== id) newPlayers.push(players[i]);
  window.players = newPlayers;
  updatePlayersMenu();
}

function updatePlayersMenu() {
  const pmen = document.getElementById("playersMenu");
  if (!pmen) return;
  pmen.innerHTML = "";
  let entry = "";
  entry += "<div class='entry'>";
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "<button class='name notclickable'>Name</button>";
  entry += editableKeymap(-1);
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "</div>";
  pmen.innerHTML += entry;
  for (let i = 0; i < players.length; i++) {
    let entry = "";
    const id = players[i].id;
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
  if (mapID === -1) {
    let html = "";
    html += "<button class='keyEditButton notclickable'>&uarr;</button>";
    html += "<button class='keyEditButton notclickable'>&larr;</button>";
    html += "<button class='keyEditButton notclickable'>&darr;</button>";
    html += "<button class='keyEditButton notclickable'>&rarr;</button>";
    html += "<button class='keyEditButton notclickable'>Fire</button>";
    return html;
  }
  if (mapID === -2) {
    let html = "";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    html += "<button class='keyEditButton notclickable'>-</button>";
    return html;
  }
  let html = "";
  for (const i in keymaps[mapID]) {
    html += "<button class='keyEditButton' onclick='editKeymap(" + mapID + ", " + i + ")' onfocusout='window.editingKeymap=false'>";
    html += keyLabels[keymaps[mapID][i]];
    html += "</button>";
  }
  return html;
}

window.editingKeymap = false;
window.editingMapID = -1;
window.editingKeyID = -1;
function editKeymap(mapID, keyID) {
  window.editingKeymap = true;
  window.editingMapID = mapID;
  window.editingKeyID = keyID;
}
function doEditKeymap(newKeyCode) {
  keymaps[editingMapID][editingKeyID] = newKeyCode;
  window.editingKeymap = false;
  updatePlayersMenu();
}

function editPlayerName(index) {
  const name = prompt("Namen eingeben:");
  if (name != null) players[index].name = name;
  updatePlayersMenu();
}

window.addPlayer = addPlayer;
window.removePlayer = removePlayer;
window.updatePlayersMenu = updatePlayersMenu;
window.editKeymap = editKeymap;
window.doEditKeymap = doEditKeymap;
window.editPlayerName = editPlayerName;
