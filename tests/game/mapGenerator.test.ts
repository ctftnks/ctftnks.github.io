import { describe, it, expect, beforeEach, vi } from "vitest";
import MapGenerator from "@/game/mapGenerator";
import GameMap from "@/game/gamemap";
import Tile from "@/game/tile";
import { store } from "@/game/store";

describe("MapGenerator", () => {
  let mockCanvas: any;
  let map: GameMap;

  beforeEach(() => {
    mockCanvas = {
      width: 1000,
      height: 1000,
      rescale: vi.fn(),
    };
    store.settings.MapNxMin = 10;
    store.settings.MapNxMax = 10;

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
});
