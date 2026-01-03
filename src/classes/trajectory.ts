import GameObject from "./gameobject";
import { Settings } from "@/store";
import GameMap from "./gamemap";
import Tank from "./tank";
import { Coord } from "./coord";

declare interface TrajectoryPoint extends Coord {
  angle: number;
}

/**
 * Represents a trajectory for ray-casting or lasers.
 * @augments GameObject
 */
export default class Trajectory extends GameObject {
  hidden: boolean = false;
  color: string = "#000";
  thickness: number = 2;
  length: number = 2000;
  angle: number | undefined;
  delta: number = 4;
  points: TrajectoryPoint[] = [];
  map: GameMap;
  drawevery: number = 1;
  timeout: number = 100;
  targets: Tank[] = [];

  /**
   * Creates a new Trajectory.
   * @param {GameMap} map - The map to trace on.
   */
  constructor(map: GameMap) {
    super();

    this.map = map;
  }

  /**
   * Draws the trajectory.
   * @param {CanvasRenderingContext2D} context - The context.
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
   */
  step(): void {
    // update points list
    this.targets = [];
    let point: TrajectoryPoint = { x: this.x!, y: this.y!, angle: this.angle! };
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
      // see if any tanks targeted
      for (let i = 0; i < tile.objs.length; i++) {
        const obj = tile.objs[i];
        if (tile && obj instanceof Tank) {
          this.targets.push(obj);
        }
      }
    }

    this.timeout -= Settings.GameFrequency;
    if (this.timeout < 0) {
      this.delete();
    }
  }
}
