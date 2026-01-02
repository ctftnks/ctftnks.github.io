import { store } from "./store";

export function updateScores() {
  const scoreBoard = document.getElementById("scoreBoard");
  if (!scoreBoard) return;
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
    if (store.players[i].spree > 1) entry += " <span class='spree'>+" + store.players[i].spree + "</span>";
    entry += store.players[i].score;
    entry += "</span></div>";
    scoreBoard.innerHTML += entry;
  }
}

export function updatePlayersMenu(): void {
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

  for (let i = 0; i < store.players.length; i++) {
    let entryRow = "";
    const id = store.players[i].id;
    entryRow += "<div class='entry'>";
    entryRow +=
      "<button class='team' onclick='store.players[" +
      i +
      "].changeColor();updatePlayersMenu();' style='color:" +
      store.players[i].color +
      ";'>&diams;</button>";
    entryRow += "<button class='name' onclick='editPlayerName(" + i + ")' style='color:" + store.players[i].color + ";'>";
    entryRow += store.players[i].name;
    entryRow += "</button>";
    if (store.players[i].isBot()) entryRow += editableKeymap(-2);
    else entryRow += editableKeymap(store.players[i].id);
    entryRow += "<button class='remove' onclick='removePlayer(" + id + ")'>&times;</button>";
    entryRow += "</div>";
    pmen.innerHTML += entryRow;
  }
  updateScores();
}

export function editPlayerName(index: number): void {
  const name = prompt("Namen eingeben:");
  if (name != null) store.players[index].name = name;
  updatePlayersMenu();
}

let editingMapID: number = -1;
let editingKeyID: number = -1;
let editingKeymap: boolean = false;

export function editKeymap(mapID: number, keyID: number): void {
  editingMapID = mapID;
  editingKeyID = keyID;
  editingKeymap = true;
}

window.addEventListener(
  "keydown",
  (event: KeyboardEvent) => {
    if (editingKeymap) {
      // Prevent default behavior while remapping keys
      event.preventDefault();
      // 'ControlLeft' or 'ControlRight' are usually forbidden in this game's logic
      if (event.code.startsWith("Control")) return;
      doEditKeymap(event.code);
    }
  },
  false,
);

export function doEditKeymap(newKeyCode: string): void {
  store.keymaps[editingMapID][editingKeyID] = newKeyCode;
  editingKeymap = false;
  updatePlayersMenu();
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
  for (let i = 0; i < store.keymaps[mapID].length; i++) {
    html +=
      "<button class='keyEditButton' onclick='editKeymap(" +
      mapID +
      ", " +
      i +
      ');this.classList.add("editing")\' onfocusout=\'editingKeymap=false;this.classList.remove("editing")\'>';
    html += getKeyLabel(store.keymaps[mapID][i]);
    html += "</button>";
  }
  return html;
}

/**
 * Returns a user-friendly label for a given key code.
 * @param {string} code
 * @returns {string}
 */
export function getKeyLabel(code: string): string {
  if (!code) return "";

  // Clean up common codes
  // KeyW -> W, ArrowUp -> Up, Digit1 -> 1, Numpad1 -> Num1
  const label = code
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace(/^Digit/, "")
    .replace(/^Numpad/, "Num");

  if (label === "Space") return "Space";
  return label.toUpperCase();
}

// Put some objects into the global scope such that they can be called by inline JS (onclick=...)
(window as any).updatePlayersMenu = updatePlayersMenu;
(window as any).editKeymap = editKeymap;
