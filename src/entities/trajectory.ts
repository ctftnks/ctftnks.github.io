import GameObject from "./gameobject";
import type GameMap from "@/game/gamemap";
import { type Coord } from "@/utils/geometry";
import type Game from "@/game/game";

declare interface TrajectoryPoint extends Coord {
  angle: number;
}

/**
 * Represents a trajectory for ray-casting or lasers.
 * @augments GameObject
 */
export class Trajectory extends GameObject {
  hidden: boolean = false;
  color: string = "#000";
  thickness: number = 2;
  length: number = 2000;
  angle: number;
  delta: number = 4;
  points: TrajectoryPoint[] = [];
  map: GameMap;
  drawevery: number = 1;
  possibleTargets: GameObject[] = [];

  /**
   * Creates a new Trajectory.
   * @param game - The game instance.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param angle - starting angle of the trajectory
   */
  constructor(game: Game, x: number, y: number, angle: number) {
    super(game);
    this.map = game.map;
    this.setPosition({ x, y });
    this.angle = angle;
    this.maxAge = 100;
  }

  /**
   * Draws the trajectory.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    if (this.hidden || this.points.length < 2) {
      return;
    }
    context.fillStyle = this.color;
    for (let i = 0; i < this.points.length; i += this.drawevery) {
      const p = this.points[i];
      context.save();
      context.translate(p.x, p.y);
      context.rotate(p.angle);
      context.fillRect(-this.thickness / 2, -this.delta / 2, this.thickness, this.delta);
      context.restore();
    }
  }

  /**
   * Calculates the trajectory.
   * @param _dt
   */
  step(_dt: number): void {
    // update points list
    this.possibleTargets = [];
    let point: TrajectoryPoint = { x: this.x, y: this.y, angle: this.angle };
    let length = 0;
    this.points = [point];

    while (length < this.length) {
      point = this.points[this.points.length - 1];
      const nextpoint: TrajectoryPoint = {
        x: point.x - this.delta * Math.sin(-point.angle),
        y: point.y - this.delta * Math.cos(-point.angle),
        angle: point.angle,
      };

      const tile = this.map.getTileByPos(point.x, point.y);
      if (tile === null) {
        return;
      }

      const walls = tile.getWalls(nextpoint.x, nextpoint.y);
      const nwalls = walls.filter((w: boolean) => w).length;
      // if there seems to be a wall: handle accordingly
      if (nwalls === 2) {
        nextpoint.angle += Math.PI;
        nextpoint.x = point.x;
        nextpoint.y = point.y;
      } else if (walls[1] || walls[3]) {
        // left or right
        nextpoint.angle *= -1;
        nextpoint.x = 2 * point.x - nextpoint.x;
      } else if (walls[0] || walls[2]) {
        // top or bottom
        nextpoint.angle = Math.PI - nextpoint.angle;
        nextpoint.y = 2 * point.y - nextpoint.y;
      }
      length += this.delta;
      this.points.push(nextpoint);
      // see if any objects targeted
      for (const obj of tile.objs) {
        this.possibleTargets.push(obj);
      }
    }
  }
}

export default Trajectory;
