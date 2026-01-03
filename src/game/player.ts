import Tank from "@/entities/tank";
import { Key } from "@/game/key";
import { generateCloud } from "@/entities/smoke";
import { Settings } from "@/game/settings";
import type Game from "./game";
import type { Base } from "@/entities/ctf";
import Team from "./team";

/**
 * Represents a Player in the game.
 * Keeps the players score, color, name, keymap
 * and the tank to be controlled
 */
export default class Player {
  public id: number;
  public name: string;
  public team: Team;
  public game: Game | undefined;
  public base: Base | undefined;
  public score: number = 0;
  public spree: number = 0;
  public keys: string[];
  public tank: Tank;
  public stats: { deaths: number; kills: number; miles: number; shots: number } = { deaths: 0, kills: 0, miles: 0, shots: 0 };

  /**
   * Creates a new Player.
   * @param {number} id - The player ID.
   * @param {string} name - The player name.
   * @param {Team} team - The team of the player
   * @param {string[]} keys - The key mapping.
   */
  public constructor(id: number, name: string, team: Team, keys: string[]) {
    this.id = id;
    this.name = name;
    this.team = team;
    this.keys = keys;
    this.tank = new Tank(this);
  }

  /**
   * Timestep: check if keys pressed and act accordingly.
   */
  public step(): void {
    if (Key.isDown(this.keys[0])) {
      this.tank.move(1);
    }
    if (Key.isDown(this.keys[1])) {
      this.tank.turn(-1);
    }
    if (Key.isDown(this.keys[2])) {
      this.tank.move(-0.7);
    }
    if (Key.isDown(this.keys[3])) {
      this.tank.turn(1);
    }
    if (Key.isDown(this.keys[4])) {
      this.tank.shoot();
    }
  }

  /**
   * Spawn at some point.
   */
  public spawn(): void {
    this.tank = new Tank(this);
    this.tank.deleted = false;
    this.tank.map = this.game!.map;
    let spos = this.game!.map.spawnPoint();

    if (typeof this.base !== "undefined" && this.base.tile !== null) {
      let spos2 = this.base.tile;
      while (spos2.id === this.base.tile.id) {
        spos2 = spos2.randomWalk(Math.pow(this.game!.mode.BaseSpawnDistance, 2) + Math.round(Math.random()));
      }
      spos = { x: spos2.x + spos2.dx / 2, y: spos2.y + spos2.dy / 2 };
    }
    this.tank.x = spos.x;
    this.tank.y = spos.y;
    this.game!.addObject(this.tank);
    this.game!.nPlayersAlive += 1;

    this.game!.timeouts.push(
      window.setTimeout(() => {
        generateCloud(this.game!, this.tank.x, this.tank.y, 4, 20, 2);
      }, 10),
    );
    // spawn shield
    this.tank.timers.spawnshield = this.game!.t + Settings.SpawnShieldTime * 1000;
  }

  /**
   * Kill the player, called when tank is shot.
   * Check if game should end.
   */
  public kill(): void {
    this.game!.nPlayersAlive -= 1;
    this.tank.weapon.isActive = false;
    this.game!.nkills++;
    this.game!.canvas.shake();
    this.spree = 0;
    this.stats.deaths += 1;
    this.game!.timeouts.push(
      window.setTimeout(() => {
        this.spawn();
      }, Settings.RespawnTime * 1000),
    );
  }

  /**
   * Change player color/team.
   * @param {Team[]} teams - List of available teams.
   */
  public changeTeam(teams: Team[]): void {
    const currentIndex = teams.indexOf(this.team);
    this.team = teams[(currentIndex + 1) % teams.length];
  }

  /**
   * Reset stats dictionary to 0.
   */
  public resetStats(): void {
    this.stats.deaths = 0;
    this.stats.kills = 0;
    this.stats.miles = 0;
    this.stats.shots = 0;
  }

  /**
   * Is the player a bot or a user?
   */
  public isBot(): boolean {
    return false;
  }
}
