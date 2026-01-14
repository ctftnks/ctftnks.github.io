import { describe, it, expect, beforeEach, vi } from "vitest";
import GameMap from "@/game/gamemap";
import Tile from "@/game/tile";
import { Settings } from "@/stores/settings";
import { getWallsForTile } from "@/physics/grid";

describe("Map Class", () => {
  let mockCanvas: any;

  beforeEach(() => {
    mockCanvas = {
      width: 1000,
      height: 800,
      rescale: vi.fn(),
    };
    // Ensure settings are stable for tests
    Settings.MapNxMin = 10;
    Settings.MapNxMax = 10;
  });

  it("should initialize with correct dimensions", () => {
    const map = new GameMap(mockCanvas, 10, 8);
    expect(map.Nx).toBe(10);
    expect(map.Ny).toBe(8);
    expect(map.tiles.length).toBe(80);
  });

  it("should link neighbors correctly", () => {
    const map = new GameMap(mockCanvas, 3, 3);
    const centerTile = map.getTileByIndex(1, 1);
    expect(centerTile).not.toBeNull();

    // Neighbors: [top, left, bottom, right]
    expect(centerTile!.neighbors[0]).toBe(map.getTileByIndex(1, 0));
    expect(centerTile!.neighbors[1]).toBe(map.getTileByIndex(0, 1));
    expect(centerTile!.neighbors[2]).toBe(map.getTileByIndex(1, 2));
    expect(centerTile!.neighbors[3]).toBe(map.getTileByIndex(2, 1));
  });

  it("should find tile by world position", () => {
    const map = new GameMap(mockCanvas, 10, 10);
    const dx = map.dx;
    const dy = map.dy;

    const tile = map.getTileByPos(dx * 2.5, dy * 3.5);
    expect(tile).not.toBeNull();
    expect(tile!.i).toBe(2);
    expect(tile!.j).toBe(3);
  });

  it("should return null for out of bounds world position", () => {
    const map = new GameMap(mockCanvas, 10, 10);
    const dx = map.dx;
    const dy = map.dy;

    // Test significantly out of bounds to avoid parseInt(small_negative) === 0
    expect(map.getTileByPos(-dx * 2, 50)).toBe(null);
    expect(map.getTileByPos(dx * 15, 50)).toBe(null);
    expect(map.getTileByPos(50, -dy * 2)).toBe(null);
    expect(map.getTileByPos(50, dy * 15)).toBe(null);
  });

  it("should find the furthest spawn point", () => {
    const map = new GameMap(mockCanvas, 5, 5); // 5x5 grid
    // Center is 2,2. Corners are 0,0; 4,0; 0,4; 4,4.

    // Avoid 0,0
    const avoid = [{ x: 0, y: 0 }];
    const furthest = map.getFurthestSpawnPoint(avoid);

    // Furthest from 0,0 in a 5x5 grid should be 4,4
    // Pixel coords: tile.x + dx/2.
    // tile 4,4: x=4*dx, y=4*dy.
    const expectedX = 4 * map.dx + map.dx / 2;
    const expectedY = 4 * map.dy + map.dy / 2;

    expect(furthest.x).toBe(expectedX);
    expect(furthest.y).toBe(expectedY);
  });
});

describe("Tile Class", () => {
  let mockMap: any;

  beforeEach(() => {
    mockMap = {
      dx: 100,
      dy: 100,
      Ny: 10,
    };
  });

  it("should calculate correct pixel coordinates", () => {
    const tile = new Tile(2, 3, mockMap);
    expect(tile.x).toBe(200);
    expect(tile.y).toBe(300);
  });

  it("should add walls correctly including neighbors", () => {
    const tile1 = new Tile(0, 0, mockMap);
    const tile2 = new Tile(1, 0, mockMap);
    tile1.neighbors[3] = tile2; // tile2 is right of tile1
    tile2.neighbors[1] = tile1; // tile1 is left of tile2

    tile1.addWall(3); // Add right wall to tile1
    expect(tile1.walls[3]).toBe(true);
    expect(tile2.walls[1]).toBe(true); // Should automatically add left wall to tile2
  });

  it("should detect walls between points", () => {
    const tile = new Tile(0, 0, mockMap);
    tile.walls[0] = true; // top wall

    // Point above tile (disty > 0)
    const walls = getWallsForTile(tile, 50, -10);
    expect(walls[0]).toBe(true);
    expect(walls[1]).toBe(false);
  });
});
