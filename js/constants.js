// Game Performance
export const FrameFrequency = 30;
export const GameFrequency = 10;

// Graphics & Sound
export const TankWidth = 34;
export const TankHeight = 50;

// player colors
export const playercolors = [
  "#DA1918", // red
  "#31B32B", // green
  "#1F87FF", // blue
  "#21B19B", // teal
  "#A020F0", // purple
  "#F4641D", // orange
  "#713B17", // brown
  "#E7E52C", // yellow
];

// Mutable settings (can be changed by user)
export let Settings = {
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
};
