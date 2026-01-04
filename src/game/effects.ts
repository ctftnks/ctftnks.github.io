import { store } from "@/stores/game";
import { Settings } from "@/stores/settings";
import Game from "./game";

/**
 * Plays a sound file if audio is not muted.
 * @param file - Path to the sound file.
 */
export function playSound(file: string): void {
  if (file !== "" && !Settings.muted) {
    const audio = new Audio(file);
    audio.play();
  }
}

let playingMusic: string | null = null;
let musicAudio: HTMLAudioElement | null = null;

/**
 * Plays background music in a loop.
 * @param file - Path to the music file.
 */
export function playMusic(file: string): void {
  if (file === playingMusic) {
    return;
  }
  const audio = new Audio(file);
  audio.addEventListener(
    "ended",
    function (this: HTMLAudioElement) {
      this.currentTime = 0;
      this.play();
    },
    false,
  );
  audio.play();
  playingMusic = file;
  musicAudio = audio;
}

/**
 * Stops the currently playing music.
 */
export function stopMusic(): void {
  if (musicAudio !== null) {
    musicAudio.pause();
  }

  musicAudio = null;
  playingMusic = null;
}

/**
 * Initiates a Fog of War effect.
 * Dims the map and reveals area around tanks.
 * @param game - The game instance.
 * @returns The interval ID of the effect loop.
 */
export function fogOfWar(game: Game): number {
  const canvas = document.getElementById("effectFrame") as HTMLCanvasElement;
  if (!canvas) {
    return -1;
  }
  canvas.height = game.canvas.canvas.clientHeight;
  canvas.width = game.canvas.canvas.clientWidth;

  const duration = 10000;
  const frequency = 30;
  let time = 0;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return -1;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(game.canvas.scale, game.canvas.scale);
  let ambientLight = 1;

  const intvl: number = window.setInterval(() => {
    ctx.clearRect(0, 0, 2 * canvas.width, 2 * canvas.height);
    if (time < 300) {
      ambientLight -= frequency / 300;
    }
    if (duration - time < 300) {
      ambientLight += frequency / 300;
    }
    ctx.fillStyle = "rgba(0,0,0," + (1 - ambientLight) + ")";
    ctx.fillRect(0, 0, game.map.Nx * game.map.dx, game.map.Ny * game.map.dy);
    for (const tank of game.getTanks()) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(tank.x, tank.y, 100, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.clearRect(tank.x - 100, tank.y - 100, 200, 200);
      ctx.closePath();
      ctx.restore();
    }
    time += frequency;
  }, frequency);

  game.intvls.push(intvl);
  window.setTimeout(() => {
    window.clearInterval(intvl);
    ctx.clearRect(0, 0, 2 * canvas.width, 2 * canvas.height);
  }, duration);
  return intvl;
}

/**
 * Clears all visual effects from the overlay canvas.
 */
export function clearEffects(): void {
  const canv = document.getElementById("effectFrame") as HTMLCanvasElement;
  if (store.game && store.game.canvas && store.game.canvas.canvas) {
    canv.height = store.game.canvas.canvas.clientHeight;
    canv.width = store.game.canvas.canvas.clientWidth;
  }
  const ctx = canv.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, 2 * canv.width, 2 * canv.height);
}

/**
 * Converts a hex color string to rgba format.
 * @param hex - The hex color string.
 * @param a - Alpha value (0-1).
 * @returns The rgba color string.
 */
export function hexToRgbA(hex: string, a: number): string {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }

    const r = parseInt(c.slice(0, 2).join(""), 16);
    const g = parseInt(c.slice(2, 4).join(""), 16);
    const b = parseInt(c.slice(4, 6).join(""), 16);
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }
  throw new Error("bad hex");
}
