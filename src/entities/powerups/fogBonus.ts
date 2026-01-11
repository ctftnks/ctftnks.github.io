import { PowerUp } from "./powerup";
import type Tank from "../tank";
import { IMAGES } from "@/game/assets";
import type Game from "@/game/game";
import Updatable from "../updatable";

/**
 * Fog of War powerup.
 * @augments PowerUp
 */
export class FogBonus extends PowerUp {
  private used: boolean = false;
  /**
   * Creates a new FogBonus.
   * @param game - The game instance.
   */
  constructor(game: Game) {
    super(game);
    this.image.src = IMAGES.fog;
  }
  /**
   * Applies the fog of war effect.
   * @param tank - The tank.
   */
  apply(tank: Tank): void {
    if (!this.used) {
      const game = tank.game;
      const canvas = game.canvas.effectsCanvas;
      if (!canvas || !canvas.getContext("2d")) {
        return;
      }
      const effect = new FogEffect(game);

      // Remove existing FogEffect to avoid stacking
      const existingIndex = game.updatables.findIndex((u) => u instanceof FogEffect);
      if (existingIndex !== -1) {
        game.updatables[existingIndex].delete();
        game.updatables.splice(existingIndex, 1);
        effect.age = 300; // set higher initial age to prevent duplicate fade-in effect
      }

      game.updatables.push(effect);
      this.used = true;
    }
  }
}

/**
 * Fog of War Effect implementation as an {@link Updatable} item managed by the game.
 */
export class FogEffect extends Updatable {
  game: Game;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  duration: number = 10000;
  ambientLight: number = 1;

  constructor(game: Game) {
    super();
    this.game = game;
    this.canvas = game.canvas.effectsCanvas;
    this.canvas.height = game.canvas.canvas.clientHeight;
    this.canvas.width = game.canvas.canvas.clientWidth;
    this.ctx = this.canvas.getContext("2d")!;
    this.maxAge = this.duration;
  }

  override step(_dt: number): void {
    // Reset transform to clear the entire canvas
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.isDeleted()) {
      return;
    }

    // Apply game scale for drawing logic
    this.ctx.scale(this.game.canvas.scale, this.game.canvas.scale);

    // Calculate ambient light based on age
    if (this.age < 300) {
      this.ambientLight = 1 - this.age / 300;
    } else if (this.duration - this.age < 300) {
      this.ambientLight = 1 - (this.duration - this.age) / 300;
    } else {
      this.ambientLight = 0;
    }

    this.ctx.fillStyle = "rgba(0,0,0," + (1 - this.ambientLight) + ")";
    this.ctx.fillRect(0, 0, this.game.map.Nx * this.game.map.dx, this.game.map.Ny * this.game.map.dy);

    // Punch holes for tanks
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillStyle = "rgba(0,0,0,1)"; // Color doesn't matter for destination-out, only alpha
    for (const tank of this.game.getTanks()) {
      this.ctx.beginPath();
      this.ctx.arc(tank.x, tank.y, 100, 0, Math.PI * 2, true);
      this.ctx.fill();
    }
    this.ctx.globalCompositeOperation = "source-over";
  }
}
