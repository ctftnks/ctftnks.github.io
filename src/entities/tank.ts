import GameObject from "./gameobject";
import type Weapon from "./weapons/weapon";
import { Gun } from "./weapons/gun";
import { generateCloud } from "./smoke";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";
import { SOUNDS } from "@/game/assets";
import type Player from "@/game/player";
import PowerUp from "./powerups/powerup";
import Bullet from "./bullet";
import Flag from "./flag";
import type Game from "@/game/game";
import { type Coord, getRotatedCorners, isPointInRectangle } from "@/utils/geometry";

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
  /** Tank color. */
  color: string;
  /** Rotation angle. */
  angle: number = 2 * Math.PI * Math.random();
  /** Tank width. */
  width: number = Settings.TankWidth;
  /** Tank height. */
  height: number = Settings.TankHeight;
  /** Current weapon. */
  weapon: Weapon;
  /** Movement speed. */
  speed: number = Settings.TankSpeed;
  /** Duration of invincibility in ms. */
  invincibleDuration: number = 0;
  /** The flag currently carried, or null if none. */
  carriedFlag: Flag | null = null;
  /** Inventory of weapons (unused?). */
  weapons: Weapon[] = [];
  /** Whether rapid fire is active. */
  rapidfire: boolean = false;

  /**
   * Creates a new Tank.
   * @param player - The player owning this tank.
   * @param game - The game in which the tank lives.
   */
  constructor(
    public player: Player,
    game: Game,
  ) {
    super(game);
    this.color = this.player.team.color;
    this.weapon = new Gun(this);
  }

  /**
   * Draws the tank (rotated) on map.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.save();
    context.beginPath();
    context.translate(this.x, this.y);
    context.rotate(this.angle);
    context.rect(-this.width / 2, -this.height / 2, this.width, this.height);
    context.fillStyle = this.player.team.color;

    if (this.invincibleDuration > 0) {
      const dt = this.invincibleDuration / 600;
      context.fillStyle = `hsl(${Math.floor(360 * dt)},100%,40%)`;
    }
    if (this.spawnshield()) {
      context.fillStyle = "#555";
      context.globalAlpha = (0.7 * this.age) / (Settings.SpawnShieldTime * 1000);
    }

    context.fill();
    context.beginPath();
    context.fillStyle = "rgba(0, 0, 0, 0.15)";
    context.rect(-this.width / 2, -this.height / 2, this.width / 5, this.height);
    context.rect(this.width / 2 - this.width / 5, -this.height / 2, this.width / 5, this.height);
    context.fill();

    if (this.carriedFlag) {
      context.beginPath();
      context.fillStyle = this.carriedFlag.color;
      context.rect(-this.carriedFlag.size / 2, -this.carriedFlag.size / 2, this.carriedFlag.size / 1.1, this.carriedFlag.size / 2);
      context.fill();
      context.beginPath();
      context.fillStyle = "#000";
      context.rect(-this.carriedFlag.size / 2, -this.carriedFlag.size / 2, this.carriedFlag.size / 6, this.carriedFlag.size * 1.1);
      context.fill();
    } else if (this.weapon.image?.src) {
      context.drawImage(this.weapon.image, -this.width / 2, -this.width / 2, this.width, this.width);
    }

    // draw label
    if (Settings.ShowTankLabels) {
      context.rotate(-this.angle);
      context.fillStyle = this.player.team.color;
      context.font = "14px Arial";
      context.fillText(this.player.name, -16, -40);
      context.rotate(this.angle);
    }

    context.restore();
  }

  /**
   * Let player class check for key presses and move tank.
   * Check for collisions and handle them.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  override step(dt: number): void {
    if (this.invincibleDuration > 0) {
      this.invincibleDuration -= dt;
    }
    this.player.steer(this, dt);
    if (this.weapon.isDeleted) {
      this.defaultWeapon();
    }
    this.weapon.crosshair();
    this.checkBulletCollision();
  }

  /**
   * Move the tank forward/backwards.
   * @param direction - 1 for forward, -1 for backward.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  move(direction: number, dt: number): void {
    this.player.stats.miles += 1;
    const oldPosition = { x: this.x, y: this.y };
    const speed = this.spawnshield() && this.player.isBot() ? 0 : this.speed;

    this.x -= (direction * speed * Math.sin(-this.angle) * dt) / 1000;
    this.y -= (direction * speed * Math.cos(-this.angle) * dt) / 1000;

    // Wall collision detection
    const collidingCorner = this.checkWallCollision();
    if (collidingCorner === -1) {
      // no collision, all fine
      return;
    }
    if (collidingCorner > 4) {
      // collision: wall corner hit tank edge
      this.setPosition(oldPosition);
      return;
    }
    // collision: tank corner hit wall edge
    const oldangle = this.angle;
    while (Math.abs(oldangle - this.angle) < 0.15) {
      // try to turn the tank until the collision is resolved
      this.angle -= 0.05 * ((collidingCorner % 2) - 0.5) * direction;
      if (this.checkWallCollision() === -1) {
        return;
      }
    }
    // Collision could not be resolved. Tank is stuck
    this.setPosition(oldPosition);
    this.angle = oldangle;
  }

  /**
   * Rotate the tank.
   * @param direction - 1 for right, -1 for left.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  turn(direction: number, dt: number): void {
    const oldAngle = this.angle;
    const oldPosition = { x: this.x, y: this.y };

    this.angle += (((direction * Settings.TankTurnSpeed * dt) / 1000) * Settings.TankSpeed) / 180;

    if (this.checkWallCollision() !== -1) {
      // Collision detected. Try to nudge the tank to a valid position.
      let resolved = false;
      const maxDist = 4; // Check up to 4 pixels away
      for (let d = 1; d <= maxDist; d++) {
        const offsets = [
          { x: d, y: 0 },
          { x: -d, y: 0 },
          { x: 0, y: d },
          { x: 0, y: -d },
        ];
        for (const off of offsets) {
          this.x = oldPosition.x + off.x;
          this.y = oldPosition.y + off.y;
          if (this.checkWallCollision() === -1) {
            resolved = true;
            break;
          }
        }
        if (resolved) {
          break;
        }
      }
      if (!resolved) {
        // If could not resolve, revert everything
        this.angle = oldAngle;
        this.setPosition(oldPosition);
      }
    }
  }

  /**
   * Use the weapon.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  shoot(dt: number): void {
    if (this.spawnshield()) {
      return;
    }
    this.weapon.shoot(dt);
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
   * @returns List of corners {x, y}.
   */
  corners(): { x: number; y: number }[] {
    return getRotatedCorners(this.x, this.y, this.width, this.height, -this.angle);
  }

  /**
   * Does the tank intersect with a point?
   * @param point - a point in the 2d coordinate system {x, y}
   * @param corners - Pre-calculated tank corners.
   * @returns True if intersecting.
   */
  private intersects(point: Coord, corners: Coord[]): boolean {
    return isPointInRectangle(point, corners);
  }

  /**
   * Check for collision of the walls:
   * Checks if there is a wall between the center of the tank and each corner.
   * @returns Index of colliding corner or -1.
   */
  private checkWallCollision(): number {
    const centerTile = this.game.map.getTileByPos(this.x, this.y);
    if (!centerTile) {
      return -1;
    }
    const tankCorners = this.corners();
    // 1. Check if any tank corner crossed a wall
    for (let k = 0; k < tankCorners.length; k++) {
      const corner = tankCorners[k];
      const walls = centerTile.getWalls(corner.x, corner.y);
      if (walls[0] || walls[1] || walls[2] || walls[3]) {
        return k;
      }
    }
    // 2. Check if any wall corner is inside the tank
    // Since the tank is smaller than a tile, we only need to check the 4 corners of the current tile.
    const wallCorners = centerTile.corners();
    for (const wc of wallCorners) {
      if (wc.w && this.intersects(wc, tankCorners)) {
        return 5;
      }
    }
    return -1;
  }

  /**
   * Check for collision with a bullet.
   * Uses spatial sorting of the map class.
   * Only checks thos bullets that lie within the tiles of the tanks corners.
   */
  private checkBulletCollision(): void {
    if (this.spawnshield()) {
      return;
    }
    // create a list of bullets that may hit the tank by looking
    // at the object lists of the tiles of the tanks corners
    const bullets = new Set<Bullet>();
    const powerups = new Set<PowerUp>();

    const tankCorners = this.corners();
    for (const corner of tankCorners) {
      const tile = this.game.map.getTileByPos(corner.x, corner.y);
      if (tile) {
        for (const obj of tile?.objs ?? []) {
          if (obj instanceof Bullet && obj.age > 0) {
            bullets.add(obj);
          } else if (obj instanceof PowerUp) {
            powerups.add(obj);
          }
        }
      }
    }
    // for each bullet in the list, check if it intersects the tank
    for (const bullet of bullets) {
      if (!this.intersects(bullet, tankCorners)) {
        continue;
      }
      // Friendly fire?
      if (!Settings.FriendlyFire && this.player.team === bullet.player.team && this.player.id !== bullet.player.id) {
        continue;
      }
      if (!bullet.lethal || this.invincible()) {
        continue;
      }
      // Hit!
      bullet.explode();
      bullet.delete();
      // count stats
      if (bullet.player.team !== this.player.team) {
        bullet.player.stats.kills += 1;
      }
      // fancy explosion cloud
      generateCloud(this.game, this.x, this.y, 6);
      // let gamemode handle scoring
      this.game.mode.newKill(bullet.player, this.player);
      // kill the player, delete the tank and bullet
      playSound(SOUNDS.kill);
      this.delete();
      this.player.kill();
      this.weapon.isActive = false;
      return;
    }

    for (const powerup of powerups) {
      if (this.intersects(powerup, tankCorners)) {
        powerup.apply(this);
        powerup.delete();
      }
    }
  }

  /**
   * Is the spawnshield active?
   * @returns True if spawnshield active.
   */
  spawnshield(): boolean {
    return this.age < Settings.SpawnShieldTime * 1000;
  }

  /**
   * Properties: is invincible?
   * @returns True if invincible.
   */
  invincible(): boolean {
    return this.spawnshield() || this.invincibleDuration > 0;
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
    super.delete();
  }
}
