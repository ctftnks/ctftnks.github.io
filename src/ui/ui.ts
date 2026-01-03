import { store } from "@/game/store";
import Bot from "@/game/bot";
import Player from "@/game/player";

export function updateScores(): void {
  const scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) {
    return;
  }
  scoreBoard.innerHTML = "";

  store.players.sort((a, b) => {
    return b.score - a.score;
  });

  for (let i = 0; i < store.players.length; i++) {
    let entry = "";
    entry += "<div class='entry'>";
    entry += "<span class='name' style='color:" + store.players[i].color + ";''>";
    entry += store.players[i].name;
    entry += "</span><span class='score'>";
    if (store.players[i].spree > 1) {
      entry += " <span class='spree'>+" + store.players[i].spree + "</span>";
    }
    entry += store.players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}

export function updatePlayersMenu(): void {
  const pmen = document.getElementById("playersMenu");
  if (!pmen) {
    return;
  }
  pmen.innerHTML = "";
  let entry = "";
  entry += "<div class='entry'>";
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "<button class='name notclickable'>Name</button>";
  entry += editableKeymap(null);
  entry += "<span style='width:50px;display:inline-block;'></span>";
  entry += "</div>";
  pmen.innerHTML += entry;

  for (let i = 0; i < store.players.length; i++) {
    let entryRow = "";
    const id = store.players[i].id;
    entryRow += "<div class='entry'>";
    entryRow +=
      "<button class='team' data-action='changeColor' data-id='" + i + "' style='color:" + store.players[i].color + ";'>&diams;</button>";
    entryRow += "<button class='name' data-action='editName' data-id='" + i + "' style='color:" + store.players[i].color + ";'>";
    entryRow += store.players[i].name;
    entryRow += "</button>";
    if (store.players[i].isBot()) {
      entryRow += editableKeymap(-2);
    } else {
      entryRow += editableKeymap(store.players[i].id);
    }
    entryRow += "<button class='remove' data-action='removePlayer' data-id='" + id + "'>&times;</button>";
    entryRow += "</div>";
    pmen.innerHTML += entryRow;
  }
  updateScores();
}

export function addPlayer(bot: boolean = false): void {
  if (store.players.length >= store.keymaps.length) {
    store.keymaps.push(store.keymaps[0].slice());
  }
  if (bot) {
    store.players.push(new Bot());
  } else {
    store.players.push(new Player());
  }
  updatePlayersMenu();
}

export function removePlayer(id: number): void {
  const newPlayers = [];
  for (let i = 0; i < store.players.length; i++) {
    if (store.players[i].id !== id) {
      newPlayers.push(store.players[i]);
    }
  }
  store.players = newPlayers;
  updatePlayersMenu();
}

export function setupPlayersMenuListeners(): void {
  const pmen = document.getElementById("playersMenu");
  if (!pmen) {
    return;
  }
  // Remove existing listener if any? (Simplest is just to ensure this is called once per page load)
  // But pages are re-rendered via innerHTML, so listeners on #playersMenu are lost if #playersMenu is inside the re-rendered part.
  // wait, #playersMenu is inside the 'menu' template. So we need to re-attach every time the menu page is opened.
  pmen.addEventListener("click", handlePlayersMenuClick);
}

function handlePlayersMenuClick(event: Event): void {
  const target = event.target as HTMLElement;
  // Handle clicks on buttons or inside buttons
  const button = target.closest("button");
  if (!button) {
    return;
  }

  const action = button.getAttribute("data-action");
  if (!action) {
    return;
  }

  const id = parseInt(button.getAttribute("data-id") || "-1", 10);

  if (action === "changeColor") {
    if (store.players[id]) {
      store.players[id].changeColor();
      updatePlayersMenu();
    }
  } else if (action === "editName") {
    editPlayerName(id);
  } else if (action === "removePlayer") {
    removePlayer(id);
  } else if (action === "editKeymap") {
    const mapID = parseInt(button.getAttribute("data-map-id") || "-1", 10);
    const keyID = parseInt(button.getAttribute("data-key-index") || "-1", 10);
    if (mapID !== -1 && keyID !== -1) {
      editKeymap(mapID, keyID, button);
    }
  }
}

export function editPlayerName(index: number): void {
  const name = prompt("Namen eingeben:");
  if (name != null) {
    store.players[index].name = name;
  }
  updatePlayersMenu();
}

let editingMapID: number | null = null;
let editingKeyID: number | null = null;
let editingKeymap: boolean = false;

export function editKeymap(mapID: number, keyID: number, buttonElement?: HTMLElement): void {
  editingMapID = mapID;
  editingKeyID = keyID;
  editingKeymap = true;
  if (buttonElement) {
    buttonElement.classList.add("editing");
  }
}

window.addEventListener(
  "keydown",
  (event: KeyboardEvent) => {
    if (editingKeymap) {
      // Prevent default behavior while remapping keys
      event.preventDefault();
      // 'ControlLeft' or 'ControlRight' are usually forbidden in this game's logic
      if (event.code.startsWith("Control")) {
        return;
      }
      doEditKeymap(event.code);
    }
  },
  false,
);

export function doEditKeymap(newKeyCode: string): void {
  if (editingMapID === null || editingKeyID === null) {
    return;
  }
  store.keymaps[editingMapID][editingKeyID] = newKeyCode;
  editingKeymap = false;
  // Remove editing class from all buttons (brute force or track it)
  // updatePlayersMenu re-renders anyway
  updatePlayersMenu();
}

/**
 * edit the keymap from the menu
 * @param mapID
 * @returns HTML string with buttons for displaying the Player's keymap on screen
 */
function editableKeymap(mapID: number | null): string {
  if (mapID === null) {
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
  for (let i = 0; i < store.keymaps[mapID].length; i++) {
    html += "<button class='keyEditButton' data-action='editKeymap' data-map-id='" + mapID + "' data-key-index='" + i + "'>";
    html += getKeyLabel(store.keymaps[mapID][i]);
    html += "</button>";
  }
  return html;
}

/**
 * Returns a user-friendly label for a given key code.
 * @param {string} code
 * @returns {string} label of the key
 */
export function getKeyLabel(code: string): string {
  if (!code) {
    return "";
  }

  // Clean up common codes
  // KeyW -> W, ArrowUp -> Up, Digit1 -> 1, Numpad1 -> Num1
  const label = code
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace(/^Digit/, "")
    .replace(/^Numpad/, "Num");

  if (label === "Space") {
    return "Space";
  }
  return label.toUpperCase();
}
