import { Settings } from "@/stores/settings";
import GameObject from "@/entities/gameobject";
import Canvas from "./canvas";
import Tile from "./tile";
import Coord from "@/entities/coord";

/**
 * Represents the game map.
 *
 * Discretized in Nx * Ny tiles, which can be separated by walls (walls)
 * also the tiles keep object lists for spatial sorting
 * the canvas is passed to the constructor to provide the size of the canvas
 */
export default class GameMap {
  /** Number of tiles in X. */
  Nx: number;
  /** Number of tiles in Y. */
  Ny: number;
  /** Tile width. */
  dx: number = 130;
  /** Tile height. */
  dy: number;
  /** List of tiles. */
  tiles: Tile[] = [];
  /** The canvas. */
  canvas: Canvas;

  /**
   * Creates a new GameMap.
   * @param canvas - The canvas object.
   * @param Nx - Number of tiles in X direction.
   * @param Ny - Number of tiles in Y direction.
   */
  constructor(canvas: Canvas, Nx: number | null = null, Ny: number | null = null) {
    this.canvas = canvas;
    this.Nx = Nx ?? Math.floor(Settings.MapNxMin + (Settings.MapNxMax - Settings.MapNxMin) * Math.random());
    this.Ny = Ny ?? Math.floor(((0.25 * Math.random() + 0.75) * this.Nx * canvas.height) / canvas.width);
    this.dy = this.dx;

    // Tile initialization
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
        this.tiles.push(new Tile(i, j, this));
      }
    }

    this.linkNeighbors();
  }

  /**
   * Gets a tile by its grid index.
   * @param i - X index.
   * @param j - Y index.
   * @returns The tile or null if out of bounds.
   */
  getTileByIndex(i: number, j: number): Tile | null {
    if (i >= 0 && i < this.Nx && j >= 0 && j < this.Ny) {
      return this.tiles[i * this.Ny + j];
    }
    return null;
  }

  /**
   * Links neighboring tiles.
   */
  private linkNeighbors(): void {
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
        this.tiles[i * this.Ny + j].neighbors = [
          this.getTileByIndex(i, j - 1),
          this.getTileByIndex(i - 1, j),
          this.getTileByIndex(i, j + 1),
          this.getTileByIndex(i + 1, j),
        ];
      }
    }
  }

  /**
   * Gets a tile by its world position.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The tile or null.
   */
  getTileByPos(x: number, y: number): Tile | null {
    const i = Math.floor(x / this.dx);
    const j = Math.floor(y / this.dy);
    return this.getTileByIndex(i, j);
  }

  /**
   * Spatial sorting: clear tile object lists.
   */
  clearObjectLists(): void {
    for (const tile of this.tiles) {
      tile.objs = [];
    }
  }

  /**
   * Spatial sorting: add object to corresponding tile list.
   * @param obj - The object to add.
   */
  addObject(obj: GameObject): void {
    const tile = this.getTileByPos(obj.x, obj.y);
    if (!tile) {
      obj.delete();
    } else {
      tile.objs.push(obj);
    }
  }

  /**
   * Returns a random free spawn point.
   * @param tries - Recursion counter.
   * @returns coordinates.
   */
  spawnPoint(tries: number = 0): Coord {
    const rInt = Math.floor(Math.random() * this.tiles.length);
    const tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries < this.Nx * this.Ny) {
      return this.spawnPoint(tries + 1);
    }
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  /**
   * Draws the map.
   * @param context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (const tile of this.tiles) {
      tile.draw(context);
    }
  }

  /**
   * Update sizes of map and tiles, for window.onresize.
   */
  resize(): void {
    if (this.canvas instanceof Canvas) {
      this.canvas.rescale(Math.min(this.canvas.width / (this.dx * this.Nx), this.canvas.height / (this.dy * this.Ny)));
    }
  }
}
