import GameObject from "./gameobject";
import { Gun, Weapon } from "./weapons/weapons";
import { generateCloud } from "./smoke";
import { playSound } from "@/effects";
import { Settings } from "@/store";
import { SOUNDS } from "@/assets";
import type Player from "@/game/player";
import type GameMap from "@/game/gamemap";
import type Tile from "@/game/tile";
import { PowerUp } from "./powerup";
import Bullet from "./bullet";
import type { Flag } from "./ctf";

/**
 * Represents a Tank controlled by a player.
 *
 * Receives a player in its constructor
 * contains position, angle, speed of the tank and provides methods to move it
 * contains methods for collision detection with walls and bullets
 * contains a weapon and a method to shoot it
 * @augments GameObject
 */
export default class Tank extends GameObject {
  /** The player. */
  player: Player;
  /** Tank color. */
  color: string;
  /** The game map. */
  map: GameMap | undefined;
  /** Rotation angle. */
  angle: number;
  /** Tank width. */
  width: number;
  /** Tank height. */
  height: number;
  /** Current weapon. */
  weapon: Weapon;
  /** Movement speed. */
  speed: number;
  /** Timers for effects. */
  timers: { spawnshield: number; invincible: number } = { spawnshield: 0, invincible: 0 };
  /** The flag currently carried, or null if none. */
  carriedFlag: Flag | null = null;
  /** Inventory of weapons (unused?). */
  weapons: Weapon[] = [];
  /** Whether rapid fire is active. */
  rapidfire: boolean = false;

  /**
   * Creates a new Tank.
   * @param {Player} player - The player owning this tank.
   */
  constructor(player: Player) {
    super();
    this.player = player;
    this.color = this.player.color;
    this.angle = 2 * Math.PI * Math.random();
    this.width = Settings.TankWidth;
    this.height = Settings.TankHeight;
    this.weapon = new Gun(this);
    this.speed = Settings.TankSpeed;
    this.type = "Tank";
  }

  /**
   * Draws the tank (rotated) on map.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    context.fillStyle = this.player.color;

    if (this.timers.invincible > this.player.game!.t) {
      const dt = (this.timers.invincible - this.player.game!.t) / 600;
      context.fillStyle = "hsl(" + parseInt((360 * dt).toString()) + ",100%,40%)";
    }
    if (this.spawnshield()) {
      context.fillStyle = "#555";
      // context.globalAlpha = 0.5;
      context.globalAlpha = 0.7 * (1 - (this.timers.spawnshield - this.player.game!.t) / (Settings.SpawnShieldTime * 1000));
    }

    context.fill();
    context.beginPath();
    context.fillStyle = "rgba(0, 0, 0, 0.15)";
    context.rect(-this.width / 2, -this.height / 2, this.width / 5, this.height);
    context.rect(this.width / 2 - this.width / 5, -this.height / 2, this.width / 5, this.height);
    context.fill();

    if (this.carriedFlag !== null) {
      context.beginPath();
      context.fillStyle = this.carriedFlag.color;
      context.rect(-this.carriedFlag.size / 2, -this.carriedFlag.size / 2, this.carriedFlag.size / 1.1, this.carriedFlag.size / 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#000";
      context.rect(-this.carriedFlag.size / 2, -this.carriedFlag.size / 2, this.carriedFlag.size / 6, this.carriedFlag.size * 1.1);
      context.fill();
    } else if (this.weapon.image && this.weapon.image.src !== "") {
      context.drawImage(this.weapon.image, -this.width / 2, -this.width / 2, this.width, this.width);
    }

    // draw label
    if (Settings.ShowTankLabels) {
      context.rotate(-this.angle);
      context.fillStyle = this.player.color;
      context.font = "" + 14 + "px Arial";
      context.fillText(this.player.name, -16, -40);
      context.rotate(this.angle);
    }

    context.restore();
  }

  /**
   * Let player class check for key presses and move tank.
   * Check for collisions and handle them.
   */
  step(): void {
    this.player.step();
    if (this.weapon.isDeleted) {
      this.defaultWeapon();
    }
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

  /**
   * Move the tank forward/backwards.
   * @param {number} direction - 1 for forward, -1 for backward.
   */
  move(direction: number): void {
    this.player.stats.miles += 1;
    const oldx = this.x;
    const oldy = this.y;
    const speed = this.spawnshield() ? 0 : this.speed;

    this.x -= (direction * speed * Math.sin(-this.angle) * Settings.GameFrequency) / 1000;
    this.y -= (direction * speed * Math.cos(-this.angle) * Settings.GameFrequency) / 1000;

    const collidingCorner = this.checkWallCollision();
    if (collidingCorner !== -1) {
      this.x = oldx;
      this.y = oldy;
      const oldangle = this.angle;
      this.angle -= 0.1 * ((collidingCorner % 2) - 0.5) * direction;
      if (this.checkWallCollision() !== -1) {
        this.angle = oldangle;
      }
    }
  }

  /**
   * Rotate the tank.
   * @param {number} direction - 1 for right, -1 for left.
   */
  turn(direction: number): void {
    const oldangle = this.angle;
    this.angle += (((direction * Settings.TankTurnSpeed * Settings.GameFrequency) / 1000) * Settings.TankSpeed) / 180;

    const collidingCorner = this.checkWallCollision();
    if (collidingCorner !== -1) {
      this.angle = oldangle;
      const oldx = this.x;
      const oldy = this.y;
      const sign = (collidingCorner - 2) * direction * 0.1;
      this.x += sign * Math.cos(-this.angle);
      this.y += -sign * Math.sin(-this.angle);
      if (this.checkWallCollision() !== -1) {
        this.x -= 2 * sign * Math.cos(-this.angle);
        this.y -= -2 * sign * Math.sin(-this.angle);
        if (this.checkWallCollision() !== -1) {
          this.x = oldx;
          this.y = oldy;
        }
      }
    }
  }

  /**
   * Use the weapon.
   */
  shoot(): void {
    if (this.spawnshield()) {
      return;
    }
    this.weapon.shoot();
    if (this.weapon.isActive && this.weapon.name !== "MG") {
      this.player.stats.shots += 1;
    }
  }

  /**
   * Return to the default weapon.
   */
  defaultWeapon(): void {
    this.weapon = new Gun(this);
  }

  /**
   * Get x,y-coordinates of the tanks corners.
   * Needed for collision detection and weapon firing.
   * @returns {Array<object>} List of corners {x, y}.
   */
  corners(): { x: number; y: number }[] {
    return [
      {
        x: this.x - (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
        y: this.y + (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x + (this.width / 2) * Math.cos(-this.angle) - (this.height / 2) * Math.sin(-this.angle),
        y: this.y - (this.width / 2) * Math.sin(-this.angle) - (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x - (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
        y: this.y + (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle),
      },
      {
        x: this.x + (this.width / 2) * Math.cos(-this.angle) + (this.height / 2) * Math.sin(-this.angle),
        y: this.y - (this.width / 2) * Math.sin(-this.angle) + (this.height / 2) * Math.cos(-this.angle),
      },
    ];
  }

  /**
   * Does the tank intersect with a point?
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {boolean} True if intersecting.
   */
  intersects(x: number, y: number): boolean {
    // checks if (0 < AM*AB < AB*AB) ^ (0 < AM*AD < AD*AD)
    // see: https://math.stackexchange.com/questions/190111/how-to-check-if-a-point-is-inside-a-rectangle
    const corners = this.corners();
    const A = corners[0];
    const B = corners[1];
    const D = corners[2];
    const AMAB = (A.x - x) * (A.x - B.x) + (A.y - y) * (A.y - B.y);
    const AMAD = (A.x - x) * (A.x - D.x) + (A.y - y) * (A.y - D.y);
    const ABAB = (A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y);
    const ADAD = (A.x - D.x) * (A.x - D.x) + (A.y - D.y) * (A.y - D.y);
    return 0 < AMAB && AMAB < ABAB && 0 < AMAD && AMAD < ADAD;
  }

  /**
   * Check for collision of the walls:
   * Checks if there is a wall between the center of the tank and each corner.
   * @returns {number} Index of colliding corner or -1.
   */
  checkWallCollision(): number {
    if (this.player.isBot()) {
      return -1;
    }
    if (!this.map) {
      return -1;
    }
    const tile = this.map.getTileByPos(this.x, this.y);
    if (tile === null) {
      return -1;
    }
    const corners = this.corners();
    const tiles = [];
    for (let i = 0; i < 4; i++) {
      if (tile.getWalls(corners[i].x, corners[i].y).filter((w) => w).length !== 0) {
        return i;
      }
      const tile2 = this.map.getTileByPos(corners[i].x, corners[i].y);
      if (tile2 !== tile) {
        tiles.push(tile2);
      }
    }
    // check if any wall corner end intersects with the tank
    for (let t = 0; t < tiles.length; t++) {
      const currentTile = tiles[t];
      if (currentTile === null) {
        continue;
      }
      const corners = (currentTile as Tile).corners();
      for (let i = 0; i < 4; i++) {
        if (corners[i].w && this.intersects(corners[i].x, corners[i].y)) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Check for collision with a bullet.
   * Uses spatial sorting of the map class.
   * Only checks thos bullets that lie within the tiles of the tanks corners.
   */
  checkBulletCollision(): void {
    if (this.spawnshield()) {
      return;
    }
    if (!this.map) {
      return;
    }
    // create a list of bullets that may hit the tank by looking
    // at the object lists of the tiles of the tanks corners
    const bullets: Bullet[] = [];
    const powerups: PowerUp[] = [];
    const corners = this.corners();
    for (let m = 0; m < 4; m++) {
      const tile = this.map.getTileByPos(corners[m].x, corners[m].y);
      if (tile !== null) {
        for (let j = 0; j < tile.objs.length; j++) {
          const obj: GameObject = tile.objs[j];
          if (obj instanceof Bullet && (obj as Bullet).age > 0) {
            bullets.push(obj as Bullet);
          }
          if (obj instanceof PowerUp) {
            powerups.push(obj as PowerUp);
          }
        }
      }
    }
    // for each bullet in the list, check if it intersects the tank
    for (let i = 0; i < bullets.length; i++) {
      if (this.intersects(bullets[i].x, bullets[i].y)) {
        // Friendly fire?
        if (!Settings.FriendlyFire && this.player.team === bullets[i].player.team && this.player.id !== bullets[i].player.id) {
          return;
        }
        if (!bullets[i].lethal) {
          return;
        }
        // Hit!
        if (this.invincible()) {
          return;
        }

        bullets[i].explode();
        bullets[i].delete();
        // count stats
        if (bullets[i].player.team !== this.player.team) {
          bullets[i].player.stats.kills += 1;
        }
        // fancy explosion cloud
        generateCloud(this.player.game!, this.x, this.y, 6);
        // let gamemode handle scoring
        this.player.game!.mode.newKill(bullets[i].player, this.player);
        // kill the player, delete the tank and bullet
        playSound(SOUNDS.kill);
        this.delete();
        this.player.kill();
        return;
      }
    }

    for (let i = 0; i < powerups.length; i++) {
      if (this.intersects(powerups[i].x, powerups[i].y)) {
        powerups[i].apply(this);
        powerups[i].delete();
      }
    }
  }

  /**
   * Is the spawnshield active?
   * @returns {boolean} True if spawnshield active.
   */
  spawnshield(): boolean {
    const t = this.player.game!.t;
    return this.timers.spawnshield > t;
  }

  /**
   * Properties: is invincible?
   * @returns {boolean} True if invincible.
   */
  invincible(): boolean {
    const t = this.player.game!.t;
    return this.timers.spawnshield > t || this.timers.invincible > t;
  }

  /**
   * Deletes the tank.
   */
  delete(): void {
    // CTF: if tank has flag, drop it
    if (this.carriedFlag !== null) {
      this.carriedFlag.drop(this.x, this.y);
    }
    // delete the weapon
    this.weapon.delete();
    // mark the tank as deleted
    this.deleted = true;
  }
}
