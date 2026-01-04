import type Canvas from "@/game/canvas";
import type Game from "@/game/game";
import Player from "@/game/player";
import Bot from "@/game/bot";
import { Settings } from "./settings";
import { TEAMS } from "@/game/team";

/**
 * Data Structure for the global state of the website.
 * Manages players, game instances, and settings persistence.
 */
class GameStore {
  game?: Game;
  canvas?: Canvas;
  players: Player[] = [];
  nplayers: number = 0;
  editingKeymap: boolean = false;
  GameID: number = 0;

  /**
   * Default keymaps using modern KeyboardEvent.code strings.
   * order: up, left, down, right, fire
   */
  keymaps: string[][] = [
    ["ArrowUp", "ArrowLeft", "ArrowDown", "ArrowRight", "Space"],
    ["KeyW", "KeyA", "KeyS", "KeyD", "KeyQ"],
    ["Numpad8", "Numpad4", "Numpad5", "Numpad6", "Numpad7"],
    ["KeyF", "KeyC", "KeyV", "KeyB", "KeyX"],
    ["KeyZ", "KeyG", "KeyH", "KeyJ", "KeyT"],
    ["KeyK", "KeyM", "Comma", "Period", "KeyN"],
    ["Digit4", "KeyE", "KeyR", "Digit5", "Digit3"],
    ["Digit8", "KeyU", "KeyI", "Digit9", "Digit7"],
  ];

  /**
   * Creates a new GameStore and loads saved settings.
   */
  constructor() {
    this.loadSettings();
  }

  /**
   * Creates a new player or bot and adds it to the store.
   * @param isBot - Whether the player should be a bot.
   * @returns The newly created player.
   */
  createPlayer(isBot: boolean = false): Player {
    const id = this.nplayers;
    this.nplayers++;
    const name = (isBot ? "Bot " : "Player ") + (id + 1);
    const team = TEAMS[id % TEAMS.length];
    const keys = this.keymaps[id] || this.keymaps[0].slice();

    if (isBot) {
      return new Bot(id, name, team);
    }
    return new Player(id, name, team, keys);
  }

  /**
   * Saves current settings to localStorage.
   */
  saveSettings(): void {
    localStorage.setItem("ctftanks_settings", JSON.stringify(Settings));
  }

  /**
   * Loads settings from localStorage if available.
   */
  loadSettings(): void {
    const saved = localStorage.getItem("ctftanks_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        for (const key in parsed) {
          if (key in Settings) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Settings as any)[key] = parsed[key];
          }
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }
}

// Export a singleton instance
import { reactive } from "vue";
export const store = reactive(new GameStore()) as GameStore;
