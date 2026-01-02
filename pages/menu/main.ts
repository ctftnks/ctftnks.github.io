import template from "./main.html?raw";
import "./style.css";
import Bot from "../../src/classes/bot";
import Player from "../../src/classes/player";
import { updateScores } from "../../src/main";
import { keymaps, getKeyLabel } from "../../src/keybindings";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updatePlayersMenu();
  const gameObj: any = (window as any).game;
  if (typeof gameObj !== "undefined") gameObj.paused = true;
}

function addPlayer(bot: boolean = false): void {
  const players: any[] = (window as any).players;
  if (players.length >= keymaps.length) keymaps.push(keymaps[0].slice());
  if (bot) players.push(new Bot());
  else players.push(new Player());
  updatePlayersMenu();
}

function removePlayer(id: number): void {
  const players: any[] = (window as any).players;
  const newPlayers = [];
  for (let i = 0; i < players.length; i++) if (players[i].id !== id) newPlayers.push(players[i]);
  (window as any).players = newPlayers;
  updatePlayersMenu();
}

function updatePlayersMenu(): void {
  const players: any[] = (window as any).players;
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
    let entryRow = "";
    const id = players[i].id;
    entryRow += "<div class='entry'>";
    entryRow +=
      "<button class='team' onclick='players[" +
      i +
      "].changeColor();updatePlayersMenu();' style='color:" +
      players[i].color +
      ";'>&diams;</button>";
    entryRow += "<button class='name' onclick='editPlayerName(" + i + ")' style='color:" + players[i].color + ";'>";
    entryRow += players[i].name;
    entryRow += "</button>";
    if (players[i] instanceof Bot) entryRow += editableKeymap(-2);
    else entryRow += editableKeymap(players[i].id);
    entryRow += "<button class='remove' onclick='removePlayer(" + id + ")'>&times;</button>";
    entryRow += "</div>";
    pmen.innerHTML += entryRow;
  }
  updateScores();
}

/** edit the keymap from the menu */
function editableKeymap(mapID: number): string {
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
  for (let i = 0; i < keymaps[mapID].length; i++) {
    html +=
      "<button class='keyEditButton' onclick='editKeymap(" +
      mapID +
      ", " +
      i +
      ');this.classList.add("editing")\' onfocusout=\'window.editingKeymap=false;this.classList.remove("editing")\'>';
    html += getKeyLabel(keymaps[mapID][i]);
    html += "</button>";
  }
  return html;
}

let editingKeymap: boolean = false;
let editingMapID: number = -1;
let editingKeyID: number = -1;

function editKeymap(mapID: number, keyID: number): void {
  editingKeymap = true;
  editingMapID = mapID;
  editingKeyID = keyID;
  (window as any).editingKeymap = editingKeymap;
  (window as any).editingMapID = editingMapID;
  (window as any).editingKeyID = editingKeyID;
}

function doEditKeymap(newKeyCode: number): void {
  keymaps[editingMapID][editingKeyID] = newKeyCode;
  editingKeymap = false;
  (window as any).editingKeymap = editingKeymap;
  updatePlayersMenu();
}

function editPlayerName(index: number): void {
  const players: any[] = (window as any).players;
  const name = prompt("Namen eingeben:");
  if (name != null) players[index].name = name;
  updatePlayersMenu();
}

(window as any).addPlayer = addPlayer;
(window as any).removePlayer = removePlayer;
(window as any).updatePlayersMenu = updatePlayersMenu;
(window as any).editKeymap = editKeymap;
(window as any).doEditKeymap = doEditKeymap;
(window as any).editPlayerName = editPlayerName;
