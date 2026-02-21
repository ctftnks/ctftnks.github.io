import { Settings } from "@/stores/settings";
import GameObject from "@/entities/gameobject";
import Canvas from "./canvas";
import Tile from "./tile";
import { type Coord } from "@/utils/geometry";

/**
 * Represents the game map.
 *
 * Discretized in Nx * Ny tiles, which can be separated by walls (walls)
 * also the tiles keep object lists for spatial sorting
 * the canvas is passed to the constructor to provide the size of the canvas
 */
export class GameMap {
  /** Number of horizontal tiles. Calculated based on settings and canvas aspect ratio. */
  Nx: number;
  /** Number of vertical tiles. */
  Ny: number;
  /** Tile width in world coordinates (pixels). Default is 130. */
  dx: number = 130;
  /** Tile height in world coordinates (pixels). Always equal to dx (square tiles). */
  dy: number;
  /** Flat array of all tiles in the map, indexed as `i * Ny + j`. */
  tiles: Tile[] = [];

  /**
   * Creates a new GameMap.
   * @param canvas - The canvas object.
   * @param Nx - Number of tiles in X direction.
   * @param Ny - Number of tiles in Y direction.
   */
  constructor(
    public canvas: Canvas,
    Nx: number | null = null,
    Ny: number | null = null,
  ) {
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
   * Gets a tile by its world position.
   * @param x - X coordinate.
   * @param y - Y coordinate.
   * @returns The tile or null.
   */
  getTileByPos(x: number, y: number): Tile | null {
    const i = (x / this.dx) | 0;
    const j = (y / this.dy) | 0;
    if (i >= 0 && i < this.Nx && j >= 0 && j < this.Ny) {
      return this.tiles[i * this.Ny + j];
    }
    return null;
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
      obj.tile = undefined;
    } else {
      obj.tile = tile;
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
   * Finds a spawn point that maximizes the distance to the nearest point in the avoid list.
   * Uses BFS flood fill for distance calculation (Dijkstra map).
   * @param avoidPoints - List of coordinates to avoid (e.g. existing bases).
   * @returns The best spawn point.
   */
  getFurthestSpawnPoint(avoidPoints: Coord[]): Coord {
    // 1. Initialize distances
    const distances = new Float32Array(this.tiles.length).fill(Infinity);
    const queue: Tile[] = [];

    // 2. Seed queue with avoidPoints
    // If no points to avoid, just pick a random one
    if (avoidPoints.length === 0) {
      return this.spawnPoint();
    }

    for (const p of avoidPoints) {
      const tile = this.getTileByPos(p.x, p.y);
      if (tile) {
        distances[tile.id] = 0;
        queue.push(tile);
      }
    }

    // 3. BFS Flood Fill
    let frontier = queue;
    while (frontier.length > 0) {
      const nextFrontier: Tile[] = [];
      for (const u of frontier) {
        const dist = distances[u.id];
        for (let d = 0; d < 4; d++) {
          // Check if wall exists in this direction
          if (!u.walls[d]) {
            const v = u.neighbors[d];
            if (v && distances[v.id] === Infinity) {
              distances[v.id] = dist + 1;
              nextFrontier.push(v);
            }
          }
        }
      }
      frontier = nextFrontier;
    }

    // 4. Find max distance
    let maxDist = -1;
    let bestTile: Tile | null = null;

    for (const tile of this.tiles) {
      // Ensure the tile is reachable (not Infinity) and beats the current max
      if (distances[tile.id] !== Infinity && distances[tile.id] > maxDist) {
        maxDist = distances[tile.id];
        bestTile = tile;
      }
    }

    if (bestTile) {
      return { x: bestTile.x + this.dx / 2, y: bestTile.y + this.dy / 2 };
    }

    // Fallback
    return this.spawnPoint();
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

export default GameMap;
