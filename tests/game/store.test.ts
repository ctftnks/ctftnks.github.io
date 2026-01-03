import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";

describe("Game Store", () => {
  let mockLocalStorage: Record<string, string> = {};

  beforeEach(() => {
    mockLocalStorage = {};

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Reset store settings to defaults if possible,
    // but the store is a singleton already initialized.
    // We can manually reset specific settings to test loading.
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should save settings to localStorage", () => {
    Settings.GameMode = "DM";
    store.saveSettings();

    expect(window.localStorage.setItem).toHaveBeenCalledWith("ctftanks_settings", expect.stringContaining('"GameMode":"DM"'));
  });

  it("should load settings from localStorage", () => {
    // Setup saved data
    const savedData = JSON.stringify({
      GameMode: "KOTH",
      BotSpeed: 0.5,
    });
    mockLocalStorage["ctftanks_settings"] = savedData;

    store.loadSettings();

    expect(Settings.GameMode).toBe("KOTH");
    expect(Settings.BotSpeed).toBe(0.5);
  });

  it("should handle invalid JSON in localStorage", () => {
    mockLocalStorage["ctftanks_settings"] = "{ invalid json";

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    store.loadSettings();

    expect(consoleSpy).toHaveBeenCalled();
  });

  it("should create players with incrementing IDs", () => {
    store.nplayers = 0;
    const p1 = store.createPlayer();
    const p2 = store.createPlayer();
    const b1 = store.createPlayer(true);

    expect(p1.id).toBe(0);
    expect(p1.name).toBe("Player 1");
    expect(p2.id).toBe(1);
    expect(p2.name).toBe("Player 2");
    expect(b1.id).toBe(2);
    expect(b1.name).toBe("Bot 3");
    expect(b1.isBot()).toBe(true);
  });
});
