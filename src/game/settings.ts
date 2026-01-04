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

// We export a mutable singleton object for settings to be compatible with existing code structure
// Ideally this would be an instance passed around.
export const Settings = { ...DEFAULT_SETTINGS };
