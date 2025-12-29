/**
 * Represents a trajectory for ray-casting or lasers.
 * @extends GameObject
 */
import GameObject from "./object.js";
import { GameFrequency } from "../constants.js";

export default class Trajectory extends GameObject {
  /**
   * Creates a new Trajectory.
   * @param {Map} map - The map to trace on.
   */
  constructor(map) {
    super();

    /** @type {boolean} Whether to hide the trajectory. */
    this.hidden = false;
    /** @type {string} Color. */
    this.color = "#000";
    /** @type {number} Thickness of line. */
    this.thickness = 2;
    /** @type {number} Maximum length. */
    this.length = 2000;
    /** @type {number} Start X. */
    this.x = undefined;
    /** @type {number} Start Y. */
    this.y = undefined;
    /** @type {number} Angle. */
    this.angle = undefined;
    /** @type {number} Step size. */
    this.delta = 4;
    /** @type {Array<Object>} List of points on trajectory. */
    this.points = [];
    /** @type {Map} The map. */
    this.map = map;
    /** @type {number} Draw every Nth point. */
    this.drawevery = 1;
    /** @type {number} Timeout. */
    this.timeout = 100;
    /** @type {Array<GameObject>} Targets hit. */
    this.targets = [];
  }

  /**
   * Draws the trajectory.
   * @param {Object} canvas - The canvas.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(canvas, context) {
    if (this.hidden) return;
    for (var i = 0; i < this.points.length; i += this.drawevery) {
      var p = this.points[i];
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
  step() {
    // update points list
    this.targets = [];
    var point = { x: this.x, y: this.y, angle: this.angle };
    var length = 0;
    this.points = [point];
    while (length < this.length) {
      point = this.points[this.points.length - 1];
      var nextpoint = {
        x: point.x - this.delta * Math.sin(-point.angle),
        y: point.y - this.delta * Math.cos(-point.angle),
        angle: point.angle,
      };
      var tile = this.map.getTileByPos(point.x, point.y);
      if (tile == -1) return;
      var walls = tile.getWalls(nextpoint.x, nextpoint.y);
      var nwalls = walls.filter((w) => w).length;
      // if there seems to be a wall: handle accordingly
      if (nwalls == 2) {
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
      for (var i = 0; i < tile.objs.length; i++) if (tile.objs[i].type == "Tank") this.targets.push(tile.objs[i]);
    }

    this.timeout -= GameFrequency;
    if (this.timeout < 0) this.delete();
  }
}
