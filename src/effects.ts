import { store, Settings } from "@/store";

export function playSound(file: string): void {
  if (file !== "" && !Settings.muted) {
    const audio = new Audio(file);
    audio.play();
  }
}

export let playingMusic: string | null = null;
export let musicAudio: HTMLAudioElement | null = null;

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

export function stopMusic(): void {
  if (musicAudio !== null) {
    musicAudio.pause();
  }

  musicAudio = null;
  playingMusic = null;
}

export let effectCanvasID: number = 0;

export function newEffectCanvas(): HTMLCanvasElement {
  const canv = document.createElement("canvas");
  effectCanvasID++;
  const id = "effectCanvas" + effectCanvasID;
  canv.id = id;
  canv.setAttribute("class", "effectCanvas");
  document.body.appendChild(canv);
  return canv;
}

export function fogOfWar(game: any): number {
  const canv = document.getElementById("effectFrame") as HTMLCanvasElement;
  canv.height = game.canvas.canvas.clientHeight;
  canv.width = game.canvas.canvas.clientWidth;

  const duration = 10000;
  const frequency = 30;
  let time = 0;
  const ctx = canv.getContext("2d")!;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(game.canvas.scale, game.canvas.scale);
  let ambientLight = 1;

  const intvl = setInterval(() => {
    ctx.clearRect(0, 0, 2 * canv.width, 2 * canv.height);
    if (time < 300) {
      ambientLight -= frequency / 300;
    }
    if (duration - time < 300) {
      ambientLight += frequency / 300;
    }
    ctx.fillStyle = "rgba(0,0,0," + (1 - ambientLight) + ")";
    ctx.fillRect(0, 0, game.map.Nx * game.map.dx, game.map.Ny * game.map.dy);
    for (let i = 0; i < game.players.length; i++) {
      const x = game.players[i].tank.x;
      const y = game.players[i].tank.y;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 100, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.clearRect(x - 100, y - 100, 200, 200);
      ctx.closePath();
      ctx.restore();
    }
    time += frequency;
  }, frequency);

  game.intvls.push(intvl);
  setTimeout(() => {
    clearInterval(intvl);
    ctx.clearRect(0, 0, 2 * canv.width, 2 * canv.height);
  }, duration);
  return intvl;
}

export function clearEffects(): void {
  const canv = document.getElementById("effectFrame") as HTMLCanvasElement;
  if (store.game && store.game.canvas && store.game.canvas.canvas) {
    canv.height = store.game.canvas.canvas.clientHeight;
    canv.width = store.game.canvas.canvas.clientWidth;
  }
  const ctx = canv.getContext("2d")!;
  ctx.clearRect(0, 0, 2 * canv.width, 2 * canv.height);
}

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
