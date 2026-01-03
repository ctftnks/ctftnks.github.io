import { BasePage } from "@/ui/BasePage";
import template from "./main.html?raw";
import "./style.css";
import { store } from "@/game/store";
import { openPage, closePage } from "@/ui/pages";
import { newGame } from "@/game/game";
import { TEAMS } from "@/game/team";
import { EVENTS, gameEvents } from "@/game/events";

/**
 * MenuPage - Manages the main menu with player setup and configuration
 */
export class MenuPage extends BasePage {
  private editingMapID: number | null = null;
  private editingKeyID: number | null = null;
  private editingKeymap: boolean = false;
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Renders the menu template.
   */
  protected render(): void {
    this.innerHTML = template;
  }

  /**
   * Attaches listeners for menu actions and player management.
   */
  protected attachListeners(): void {
    const shade = this.querySelector("#menuShade");
    if (shade) {
      shade.addEventListener("click", () => {
        closePage(this);
        if (!store.game) {
          newGame();
        } else {
          store.game.paused = false;
        }
        window.dispatchEvent(new Event("resize"));
      });
    }

    const btnPowerups = this.querySelector("#btnPowerups");
    if (btnPowerups) {
      btnPowerups.addEventListener("click", () => openPage("powerups"));
    }

    const btnSettings = this.querySelector("#btnSettings");
    if (btnSettings) {
      btnSettings.addEventListener("click", () => openPage("settings"));
    }

    const btnAddPlayer = this.querySelector("#btnAddPlayer");
    if (btnAddPlayer) {
      btnAddPlayer.addEventListener("click", () => this.addPlayer());
    }

    const btnAddBot = this.querySelector("#btnAddBot");
    if (btnAddBot) {
      btnAddBot.addEventListener("click", () => this.addPlayer(true));
    }

    const btnQuickTeams = this.querySelector("#btnQuickTeams");
    if (btnQuickTeams) {
      btnQuickTeams.addEventListener("click", () => openPage("quickstart"));
    }

    const btnStartGame = this.querySelector("#btnStartGame");
    if (btnStartGame) {
      btnStartGame.addEventListener("click", () => {
        closePage(this);
        newGame();
        window.dispatchEvent(new Event("resize"));
      });
    }

    this.setupPlayersMenuListeners();
  }

  /**
   * Pauses the game and sets up keydown listeners on mount.
   */
  protected onMount(): void {
    this.updatePlayersMenu();

    if (typeof store.game !== "undefined") {
      store.game.paused = true;
    }

    // Setup global keydown listener for keymap editing
    this.keydownHandler = (event: KeyboardEvent) => {
      if (this.editingKeymap) {
        event.preventDefault();
        if (event.code.startsWith("Control")) {
          return;
        }
        this.doEditKeymap(event.code);
      }
    };
    window.addEventListener("keydown", this.keydownHandler);
  }

  /**
   * Removes keydown listeners on unmount.
   */
  protected onUnmount(): void {
    if (this.keydownHandler) {
      window.removeEventListener("keydown", this.keydownHandler);
    }
  }

  /**
   * Update the players menu UI
   */
  updatePlayersMenu(): void {
    const pmen = this.querySelector("#playersMenu");
    if (!pmen) {
      return;
    }
    pmen.innerHTML = "";
    let entry = "";
    entry += "<div class='entry'>";
    entry += "<span style='width:50px;display:inline-block;'></span>";
    entry += "<button class='name notclickable'>Name</button>";
    entry += this.editableKeymap(null);
    entry += "<span style='width:50px;display:inline-block;'></span>";
    entry += "</div>";
    pmen.innerHTML += entry;

    for (let i = 0; i < store.players.length; i++) {
      let entryRow = "";
      const id = store.players[i].id;
      entryRow += "<div class='entry'>";
      entryRow +=
        "<button class='team' data-action='changeTeam' data-id='" +
        i +
        "' style='color:" +
        store.players[i].team.color +
        ";'>&diams;</button>";
      entryRow += "<button class='name' data-action='editName' data-id='" + i + "' style='color:" + store.players[i].team.color + ";'>";
      entryRow += store.players[i].name;
      entryRow += "</button>";
      if (store.players[i].isBot()) {
        entryRow += this.editableKeymap(-2);
      } else {
        entryRow += this.editableKeymap(store.players[i].id);
      }
      entryRow += "<button class='remove' data-action='removePlayer' data-id='" + id + "'>&times;</button>";
      entryRow += "</div>";
      pmen.innerHTML += entryRow;
    }
    gameEvents.emit(EVENTS.SCORE_UPDATED);
  }

  /**
   * Add a new player to the game
   * @param bot - Whether the player is a bot
   */
  addPlayer(bot: boolean = false): void {
    if (store.players.length >= store.keymaps.length) {
      store.keymaps.push(store.keymaps[0].slice());
    }
    store.players.push(store.createPlayer(bot));
    this.updatePlayersMenu();
  }

  /**
   * Remove a player from the game
   * @param id - Player ID to remove
   */
  removePlayer(id: number): void {
    const newPlayers = [];
    for (let i = 0; i < store.players.length; i++) {
      if (store.players[i].id !== id) {
        newPlayers.push(store.players[i]);
      }
    }
    store.players = newPlayers;
    this.updatePlayersMenu();
  }

  /**
   * Setup event listeners for the players menu
   */
  private setupPlayersMenuListeners(): void {
    const pmen = this.querySelector("#playersMenu");
    if (!pmen) {
      return;
    }
    pmen.addEventListener("click", (event: Event) => this.handlePlayersMenuClick(event));
  }

  /**
   * Handle clicks on player menu buttons
   * @param event - The click event
   */
  private handlePlayersMenuClick(event: Event): void {
    const target = event.target as HTMLElement;
    const button = target.closest("button");
    if (!button) {
      return;
    }

    const action = button.getAttribute("data-action");
    if (!action) {
      return;
    }

    const id = parseInt(button.getAttribute("data-id") || "-1", 10);

    if (action === "changeTeam") {
      const player = store.players[id];
      const currentIndex = TEAMS.indexOf(player.team);
      player.team = TEAMS[(currentIndex + 1) % TEAMS.length];
      this.updatePlayersMenu();
    } else if (action === "editName") {
      this.editPlayerName(id);
    } else if (action === "removePlayer") {
      this.removePlayer(id);
    } else if (action === "editKeymap") {
      const mapID = parseInt(button.getAttribute("data-map-id") || "-1", 10);
      const keyID = parseInt(button.getAttribute("data-key-index") || "-1", 10);
      if (mapID !== -1 && keyID !== -1) {
        this.startEditKeymap(mapID, keyID, button);
      }
    }
  }

  /**
   * Edit a player's name
   * @param index - Player index to edit
   */
  private editPlayerName(index: number): void {
    const name = prompt("Namen eingeben:");
    if (name != null) {
      store.players[index].name = name;
    }
    this.updatePlayersMenu();
  }

  /**
   * Start editing a keymap binding
   * @param mapID - Keymap ID to edit
   * @param keyID - Key index to edit
   * @param buttonElement - The button element being edited
   */
  private startEditKeymap(mapID: number, keyID: number, buttonElement?: HTMLElement): void {
    this.editingMapID = mapID;
    this.editingKeyID = keyID;
    this.editingKeymap = true;
    if (buttonElement) {
      buttonElement.classList.add("editing");
    }
  }

  /**
   * Apply the new keymap binding
   * @param newKeyCode - The new key code
   */
  private doEditKeymap(newKeyCode: string): void {
    if (this.editingMapID === null || this.editingKeyID === null) {
      return;
    }
    store.keymaps[this.editingMapID][this.editingKeyID] = newKeyCode;
    this.editingKeymap = false;
    this.updatePlayersMenu();
  }

  /**
   * Generate HTML for editable keymap buttons
   * @param mapID - The keymap ID (null for header, -2 for bot)
   */
  private editableKeymap(mapID: number | null): string {
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
}

/**
 * Returns a user-friendly label for a given key code
 * @param code - The key code to format
 */
export function getKeyLabel(code: string): string {
  if (!code) {
    return "";
  }

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

customElements.define("menu-page", MenuPage);

export function init(container: HTMLElement): void {
  const component = new MenuPage();
  container.appendChild(component);
}

// Public exports for backward compatibility with QuickstartPage
export function updatePlayersMenu(): void {
  // Get the active menu page and update it
  const menuPage = document.querySelector("menu-page") as MenuPage | null;
  if (menuPage) {
    menuPage.updatePlayersMenu();
  }
}

export function addPlayer(bot: boolean = false): void {
  const menuPage = document.querySelector("menu-page") as MenuPage | null;
  if (menuPage) {
    menuPage.addPlayer(bot);
  }
}
