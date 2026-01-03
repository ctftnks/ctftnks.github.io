import { store } from "@/store";
import GameObject from "@/entities/gameobject";
import Canvas from "./canvas";
import Tile from "./tile";
import { Coord } from "@/entities/coord";

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

  /**
   * Creates a new GameMap.
   * @param {Canvas} canvas - The canvas object.
   * @param {number} Nx - Number of tiles in X direction.
   * @param {number} Ny - Number of tiles in Y direction.
   */
  constructor(canvas: Canvas, Nx: number | null = null, Ny: number | null = null) {
    if (Nx === null) {
      this.Nx = parseInt((store.settings.MapNxMin + (store.settings.MapNxMax - store.settings.MapNxMin) * Math.random()).toString());
    } else {
      this.Nx = Nx;
    }

    if (Ny === null) {
      this.Ny = parseInt((((0.25 * Math.random() + 0.75) * this.Nx * canvas!.height) / canvas!.width).toString());
    } else {
      this.Ny = Ny;
    }

    // this.dy = canvas.height / this.Ny;
    this.dy = this.dx;

    // Tile initialization
    // create discrete tiles
    for (let i = 0; i < this.Nx; i++) {
      for (let j = 0; j < this.Ny; j++) {
        this.tiles.push(new Tile(i, j, this));
      }
    }

    this.linkNeighbors();
  }

  /**
   * Gets a tile by its grid index.
   * @param {number} i - X index.
   * @param {number} j - Y index.
   * @returns {Tile|null} The tile or null if out of bounds.
   */
  getTileByIndex(i: number, j: number): Tile | null {
    if (i < this.Nx && j < this.Ny && i >= 0 && j >= 0) {
      return this.tiles[i * this.Ny + j];
    }
    return null;
  }

  /**
   * Links neighboring tiles.
   */
  linkNeighbors(): void {
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
   * @param {number} x - X coordinate.
   * @param {number} y - Y coordinate.
   * @returns {Tile|null} The tile or null.
   */
  getTileByPos(x: number, y: number): Tile | null {
    const i = parseInt((x / this.dx).toString());
    const j = parseInt((y / this.dy).toString());
    return this.getTileByIndex(i, j);
  }

  /**
   * Spatial sorting: clear tile object lists.
   */
  clearObjectLists(): void {
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].objs = [];
    }
  }

  /**
   * Spatial sorting: add object to corresponding tile list.
   * @param {GameObject} obj - The object to add.
   */
  addObject(obj: GameObject): void {
    const tile = this.getTileByPos(obj.x, obj.y);
    if (tile === null) {
      obj.delete();
    } else {
      tile.objs.push(obj);
    }
  }

  /**
   * Returns a random free spawn point.
   * @param {number} tries - Recursion counter.
   * @returns {object} {x, y} coordinates.
   */
  spawnPoint(tries: number = 0): Coord {
    const rInt = parseInt((Math.random() * (this.Nx * this.Ny - 1)).toString());
    const tile = this.tiles[rInt];
    // if there is something else already, find another point
    if (tile.objs.length > 0 && tries++ < this.Nx * this.Ny) {
      return this.spawnPoint(tries);
    }
    return { x: tile.x + this.dx / 2, y: tile.y + this.dy / 2 };
  }

  /**
   * Draws the map.
   * @param {CanvasRenderingContext2D} context - The context.
   */
  draw(context: CanvasRenderingContext2D): void {
    context.fillStyle = "#edede8";
    context.fillRect(0, 0, this.Nx * this.dx, this.Ny * this.dy);
    for (let i = 0; i < this.tiles.length; i++) {
      this.tiles[i].draw(context);
    }
  }

  /**
   * Update sizes of map and tiles, for window.onresize.
   */
  resize(): void {
    if (store.canvas instanceof Canvas) {
      store.canvas.rescale(Math.min(store.canvas.width / (this.dx * this.Nx), store.canvas.height / (this.dy * this.Ny)));
    }
  }
}
