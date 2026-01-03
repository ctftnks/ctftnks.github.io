import type Canvas from "@/game/canvas";
import type Game from "@/game/game";
import Player from "@/game/player";
import Bot from "@/game/bot";
import { Settings } from "./settings";

/**
 * Data Structure for the global state of the website
 */
class GameStore {
  game: Game | undefined = undefined;
  canvas: Canvas | undefined;
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

  playercolors = [
    "#DA1918", // red
    "#31B32B", // green
    "#1F87FF", // blue
    "#21B19B", // teal
    "#A020F0", // purple
    "#F4641D", // orange
    "#713B17", // brown
    "#E7E52C", // yellow
  ];

  constructor() {
    this.loadSettings();
  }

  createPlayer(isBot: boolean = false): Player {
    const id = this.nplayers;
    this.nplayers++;
    const name = (isBot ? "Bot " : "Player ") + (id + 1);
    const color = this.playercolors[id % this.playercolors.length];
    const keys = this.keymaps[id] || this.keymaps[0].slice();

    if (isBot) {
      return new Bot(id, name, color);
    }
    return new Player(id, name, color, keys);
  }

  saveSettings(): void {
    localStorage.setItem("ctftanks_settings", JSON.stringify(Settings));
  }

  loadSettings(): void {
    const saved = localStorage.getItem("ctftanks_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        for (const key in parsed) {
          if (key in Settings) {
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
export const store = new GameStore();
