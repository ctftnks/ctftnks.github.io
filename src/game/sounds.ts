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
