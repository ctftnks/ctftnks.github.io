import type Canvas from "@/game/canvas";
import type Game from "@/game/game";
import { createGame } from "@/game/game";
import type GameMap from "@/game/gamemap";
import Player from "@/game/player";
import Bot from "@/game/bot";
import { Settings } from "./settings";
import { TEAMS } from "@/game/team";
import { reactive, markRaw } from "vue";

/**
 * Data Structure for the global state of the website.
 * Manages players, game instances, and settings persistence.
 */
export class GameStore {
  game?: Game;
  canvas?: Canvas;
  players: Player[] = [];
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
    const id = this.players.length;
    const name = (isBot ? "Bot " : "Player ") + (id + 1);
    const team = TEAMS[id % TEAMS.length];
    const keys = this.keymaps[id] || this.keymaps[0].slice();
    const player = isBot ? new Bot(id, name, team) : new Player(id, name, team, keys);
    this.players.push(player);
    return player;
  }

  /**
   * Initializes default players if none exist.
   */
  initDefaultPlayers(): void {
    if (this.players.length > 0) {
      return;
    }
    const p0 = this.createPlayer(false);
    const p1 = this.createPlayer(true);
    const p2 = this.createPlayer(true);
    const p3 = this.createPlayer(true);
    p1.team = p0.team;
    p3.team = p2.team;
  }

  /**
   * Starts a new game round.
   * @param map - Optional map to use.
   */
  startNewGame(map: GameMap | null = null): void {
    if (this.game) {
      this.game.stop();
    }
    this.GameID++;
    if (this.canvas) {
      this.game = markRaw(createGame(this.canvas, this.players, map));
    }
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
export const store = reactive(new GameStore()) as GameStore;
