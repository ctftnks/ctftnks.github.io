import GameObject from "./gameobject";
import { Gun, Weapon } from "./weapons";
import { generateCloud } from "./smoke";
import { playSound } from "@/game/effects";
import { Settings } from "@/stores/settings";
import { SOUNDS } from "@/game/assets";
import type Player from "@/game/player";
import type Tile from "@/game/tile";
import { PowerUp } from "./powerups";
import Bullet from "./bullet";
import Flag from "./flag";
import type Game from "@/game/game";

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
  /** The player steering the tank. */
  player: Player;
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
  constructor(player: Player, game: Game) {
    super(game);
    this.player = player;
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
    const speed = this.spawnshield() ? 0 : this.speed;

    this.x -= (direction * speed * Math.sin(-this.angle) * dt) / 1000;
    this.y -= (direction * speed * Math.cos(-this.angle) * dt) / 1000;

    const collidingCorner = this.checkWallCollision();
    if (collidingCorner !== -1) {
      this.setPosition(oldPosition);
      const oldangle = this.angle;
      this.angle -= 0.1 * ((collidingCorner % 2) - 0.5) * direction;
      if (this.checkWallCollision() !== -1) {
        this.angle = oldangle;
      }
    }
  }

  /**
   * Rotate the tank.
   * @param direction - 1 for right, -1 for left.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  turn(direction: number, dt: number): void {
    const oldangle = this.angle;
    this.angle += (((direction * Settings.TankTurnSpeed * dt) / 1000) * Settings.TankSpeed) / 180;

    const collidingCorner = this.checkWallCollision();
    if (collidingCorner !== -1) {
      this.angle = oldangle;
      const oldPosition = { x: this.x, y: this.y };
      const sign = (collidingCorner - 2) * direction * 0.1;
      this.x += sign * Math.cos(-this.angle);
      this.y += -sign * Math.sin(-this.angle);
      if (this.checkWallCollision() !== -1) {
        this.x -= 2 * sign * Math.cos(-this.angle);
        this.y -= -2 * sign * Math.sin(-this.angle);
        if (this.checkWallCollision() !== -1) {
          this.setPosition(oldPosition);
        }
      }
    }
  }

  /**
   * Use the weapon.
   * @param dt - The time elapsed since the last frame in milliseconds.
   */
  shoot(dt?: number): void {
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
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns True if intersecting.
   */
  private intersects(x: number, y: number): boolean {
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
   * @returns Index of colliding corner or -1.
   */
  private checkWallCollision(): number {
    if (this.player.isBot()) {
      return -1;
    }
    const tile = this.game.map.getTileByPos(this.x, this.y);
    if (!tile) {
      return -1;
    }
    const corners = this.corners();
    const neighborTiles = new Set<Tile>();
    for (let i = 0; i < corners.length; i++) {
      const corner = corners[i];
      if (tile.getWalls(corner.x, corner.y).some((w) => w)) {
        return i;
      }
      const tileAtCorner = this.game.map.getTileByPos(corner.x, corner.y);
      if (tileAtCorner && tileAtCorner !== tile) {
        neighborTiles.add(tileAtCorner);
      }
    }
    // check if any wall corner end intersects with the tank
    for (const currentTile of neighborTiles) {
      const tileCorners = currentTile.corners();
      for (let i = 0; i < tileCorners.length; i++) {
        const corner = tileCorners[i];
        if (corner.w && this.intersects(corner.x, corner.y)) {
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
  private checkBulletCollision(): void {
    if (this.spawnshield()) {
      return;
    }
    // create a list of bullets that may hit the tank by looking
    // at the object lists of the tiles of the tanks corners
    const bullets = new Set<Bullet>();
    const powerups = new Set<PowerUp>();

    for (const corner of this.corners()) {
      const tile = this.game.map.getTileByPos(corner.x, corner.y);
      if (tile) {
        for (const obj of tile.objs) {
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
      if (!this.intersects(bullet.x, bullet.y)) {
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
      if (this.intersects(powerup.x, powerup.y)) {
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
