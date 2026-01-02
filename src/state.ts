const DEFAULT_SETTINGS = {
  muted: true,
  bgmusic: false,
  GameMode: "CTF",
  PowerUpRate: 4,
  MaxPowerUps: 8,
  RoundTime: 10,
  SpawnShieldTime: 1,
  FriendlyFire: true,
  BotsShootBots: true,
  BotSpeed: 1,
  ResetStatsEachGame: true,
  AdaptiveBotSpeed: true,
  BulletsCanCollide: true,
  TankSpeed: 200,
  TankTurnSpeed: 3.9,
  BulletSpeed: 320,
  BulletTimeout: 7,
  RespawnTime: 3,
  EndScreenTime: 15,
  ShowTankLabels: true,
  MapNxMin: 9,
  MapNxMax: 15,
  GameFrequency: 10,
  TankWidth: 34,
  TankHeight: 50,
};

type Settings = typeof DEFAULT_SETTINGS;

class GameStore {
  game: any = undefined;
  canvas: any = undefined;
  players: any[] = [];
  nplayers: number = 0;
  editingKeymap: boolean = false;
  GameID: number = 0;

  settings: Settings;

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
    this.settings = { ...DEFAULT_SETTINGS };
    this.loadSettings();
  }

  saveSettings(): void {
    localStorage.setItem("ctftanks_settings", JSON.stringify(this.settings));
  }

  loadSettings(): void {
    const saved = localStorage.getItem("ctftanks_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        for (let key in parsed) {
          if (key in this.settings) {
            (this.settings as any)[key] = parsed[key];
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

// Export a reference to settings for convenience
export const Settings = store.settings;
