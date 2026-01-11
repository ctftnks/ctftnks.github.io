import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";

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
 * Clears all visual effects from the overlay canvas.
 */
export function clearEffects(): void {
  if (!store.game || !store.game.canvas) {
    return;
  }
  const canv = store.game.canvas.effectsCanvas;
  canv.height = store.game.canvas.canvas.clientHeight;
  canv.width = store.game.canvas.canvas.clientWidth;

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
