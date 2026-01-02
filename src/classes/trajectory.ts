import GameObject from "./object";
import { Settings } from "../state";
import GameMap from "./map";

/**
 * Represents a trajectory for ray-casting or lasers.
 * @extends GameObject
 */
export default class Trajectory extends GameObject {
  hidden: boolean = false;
  color: string = "#000";
  thickness: number = 2;
  length: number;
  angle: number | undefined;
  delta: number;
  points: any[] = [];
  map: GameMap;
  drawevery: number = 1;
  timeout: number = 100;
  targets: any[] = [];

  /**
   * Creates a new Trajectory.
   * @param {GameMap} map - The map to trace on.
   */
  constructor(map: GameMap) {
    super();

    this.hidden = false;
    this.color = "#000";
    this.thickness = 2;
    this.length = 2000;
    this.angle = undefined;
    this.delta = 4;
    this.points = [];
    this.map = map;
    this.drawevery = 1;
    this.timeout = 100;
    this.targets = [];
  }

  /**
   * Draws the trajectory.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas: any, context: CanvasRenderingContext2D): void {
    if (this.hidden) return;
    for (let i = 0; i < this.points.length; i += this.drawevery) {
      const p = this.points[i];
      // TODO less save & restore
      context.save();
      context.beginPath();
      context.translate(p.x, p.y);
      context.rotate(p.angle);
      context.rect(-this.thickness / 2, -this.delta / 2, this.thickness, this.delta);
      context.fillStyle = this.color;
      context.fill();
      context.restore();
    }
  }

  /**
   * Calculates the trajectory.
   */
  step(): void {
    // update points list
    this.targets = [];
    let point = { x: this.x!, y: this.y!, angle: this.angle! };
    let length = 0;
    this.points = [point];

    while (length < this.length) {
      point = this.points[this.points.length - 1];
      const nextpoint = {
        x: point.x - this.delta * Math.sin(-point.angle),
        y: point.y - this.delta * Math.cos(-point.angle),
        angle: point.angle,
      };

      const tile = this.map.getTileByPos(point.x, point.y);
      if (tile === -1) return;

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
        if (tile.objs[i].type === "Tank") this.targets.push(tile.objs[i]);
      }
    }

    this.timeout -= Settings.GameFrequency;
    if (this.timeout < 0) this.delete();
  }
}
