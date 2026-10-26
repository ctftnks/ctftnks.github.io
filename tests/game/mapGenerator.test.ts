import { describe, it, expect, beforeEach, vi } from "vitest";
import MapGenerator from "@/game/mapGenerator";
import GameMap from "@/game/gamemap";
import Tile from "@/game/tile";
import { Settings } from "@/stores/settings";

describe("MapGenerator", () => {
  let mockCanvas: any;
  let map: GameMap;

  beforeEach(() => {
    mockCanvas = {
      width: 1000,
      height: 1000,
      rescale: vi.fn(),
    };
    Settings.MapNxMin = 10;
    Settings.MapNxMax = 10;

    // Initialize a fresh map for each test
    map = new GameMap(mockCanvas, 10, 10);
  });

  it("should have algorithms defined", () => {
    expect(MapGenerator.algorithms).toBeDefined();
    expect(MapGenerator.algorithms.length).toBeGreaterThan(0);
  });

  it("should generate Prim's Maze", () => {
    MapGenerator.primsMaze(map);

    // Check that some walls are set (it starts full of walls)
    // and some are removed.
    let wallCount = 0;
    let totalWalls = 0;

    for (const tile of map.tiles) {
      for (const w of tile.walls) {
        totalWalls++;
        if (w) {
          wallCount++;
        }
      }
    }

    expect(wallCount).toBeGreaterThan(0);
    expect(wallCount).toBeLessThan(totalWalls);
  });

  it("should generate a Prim's maze that is a spanning tree of all tiles", () => {
    for (let n = 0; n < 20; n++) {
      const m = new GameMap(mockCanvas, 9, 6);
      MapGenerator.primsMaze(m);

      // count passages between neighboring tiles (each passage is seen from both sides)
      let passages = 0;
      for (const tile of m.tiles) {
        for (let d = 0; d < 4; d++) {
          if (tile.neighbors[d] && !tile.walls[d]) {
            passages++;
          }
        }
      }
      expect(passages / 2).toBe(m.tiles.length - 1);

      // every tile must be reachable
      const seen = new Set<number>([m.tiles[0].id]);
      const stack: Tile[] = [m.tiles[0]];
      while (stack.length > 0) {
        const tile = stack.pop()!;
        for (let d = 0; d < 4; d++) {
          const neighbor = tile.neighbors[d];
          if (!tile.walls[d] && neighbor && !seen.has(neighbor.id)) {
            seen.add(neighbor.id);
            stack.push(neighbor);
          }
        }
      }
      expect(seen.size).toBe(m.tiles.length);
    }
  });

  it("should generate Recursive Division map", () => {
    MapGenerator.recursiveDivision(map);

    // Check border walls are set
    const topLeft = map.getTileByIndex(0, 0) as Tile;
    expect(topLeft.walls[0]).toBe(true); // top
    expect(topLeft.walls[1]).toBe(true); // left

    const bottomRight = map.getTileByIndex(9, 9) as Tile;
    expect(bottomRight.walls[2]).toBe(true); // bottom
    expect(bottomRight.walls[3]).toBe(true); // right

    // Check internal walls exist
    let internalWalls = 0;
    for (const tile of map.tiles) {
      // Count walls that are likely internal (simple heuristic)
      if (tile.walls.filter((w) => w).length > 0) {
        internalWalls++;
      }
    }
    expect(internalWalls).toBeGreaterThan(0);
  });

  it("should generate Porous Recursive Division map", () => {
    MapGenerator.porousRecursiveDivision(map);

    // Check border walls
    const topLeft = map.getTileByIndex(0, 0) as Tile;
    expect(topLeft.walls[0]).toBe(true);
    expect(topLeft.walls[1]).toBe(true);

    let internalWalls = 0;
    for (const tile of map.tiles) {
      if (tile.walls.filter((w) => w).length > 0) {
        internalWalls++;
      }
    }
    expect(internalWalls).toBeGreaterThan(0);
  });

  it("should use the porous algorithm for all subdivisions", () => {
    const plainSpy = vi.spyOn(MapGenerator, "recursiveDivision");

    MapGenerator.porousRecursiveDivision(map);

    expect(plainSpy).not.toHaveBeenCalled();
    plainSpy.mockRestore();
  });

  it("should generate porous maps in which every tile is reachable", () => {
    for (let n = 0; n < 20; n++) {
      const m = new GameMap(mockCanvas, 12, 8);
      MapGenerator.porousRecursiveDivision(m);

      const seen = new Set<number>([m.tiles[0].id]);
      const stack: Tile[] = [m.tiles[0]];
      while (stack.length > 0) {
        const tile = stack.pop()!;
        for (let d = 0; d < 4; d++) {
          const neighbor = tile.neighbors[d];
          if (!tile.walls[d] && neighbor && !seen.has(neighbor.id)) {
            seen.add(neighbor.id);
            stack.push(neighbor);
          }
        }
      }
      expect(seen.size).toBe(m.tiles.length);
    }
  });
});
