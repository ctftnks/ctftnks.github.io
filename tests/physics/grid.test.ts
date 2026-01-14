import { describe, it, expect, beforeEach, vi } from "vitest";
import Tile from "@/game/tile";
import GameMap from "@/game/gamemap";
import { getWallsForTile, checkRectMapCollision } from "@/physics/grid";
import { type Coord } from "@/physics/geometry";

// Create a simple mock map with manually linked tiles
function createMockGrid(width: number, height: number): { map: GameMap; tiles: Tile[] } {
  const mockMap = {
    Nx: width,
    Ny: height,
    dx: 100,
    dy: 100,
    tiles: [],
    getTileByIndex: vi.fn(),
    getTileByPos: vi.fn(), // Needed for checkRectMapCollision
  } as unknown as GameMap;

  // Mock getTileByPos to work with the tiles array
  (mockMap.getTileByPos as any).mockImplementation((x: number, y: number) => {
    const i = Math.floor(x / 100);
    const j = Math.floor(y / 100);
    if (i >= 0 && i < width && j >= 0 && j < height) {
      return (mockMap.tiles as Tile[])[i * height + j];
    }
    return null;
  });

  const tiles: Tile[] = [];
  // Initialize tiles
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      tiles.push(new Tile(i, j, mockMap));
    }
  }
  // Assign to map
  mockMap.tiles = tiles;

  // Link neighbors
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      const tile = tiles[i * height + j];
      const getTile = (x: number, y: number) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          return tiles[x * height + y];
        }
        return null;
      };

      tile.neighbors = [
        getTile(i, j - 1), // top
        getTile(i - 1, j), // left
        getTile(i, j + 1), // bottom
        getTile(i + 1, j), // right
      ];
    }
  }

  return { map: mockMap, tiles };
}

describe("Grid Physics - getWallsForTile", () => {
  let grid: Tile[];

  beforeEach(() => {
    const setup = createMockGrid(3, 3);
    grid = setup.tiles;
  });

  it("should identify walls between tile and a point", () => {
    const tile = grid[4]; // Center at (100, 100), size 100x100
    tile.x = 100;
    tile.y = 100;
    tile.dx = 100;
    tile.dy = 100;
    tile.walls = [true, true, true, true];

    // Point above tile
    const wallsTop = getWallsForTile(tile, 150, 50);
    expect(wallsTop[0]).toBe(true);

    // Point left of tile
    const wallsLeft = getWallsForTile(tile, 50, 150);
    expect(wallsLeft[1]).toBe(true);

    // Point below tile
    const wallsBottom = getWallsForTile(tile, 150, 250);
    expect(wallsBottom[2]).toBe(true);

    // Point right of tile
    const wallsRight = getWallsForTile(tile, 250, 150);
    expect(wallsRight[3]).toBe(true);
  });
});

describe("Grid Physics - Corner Collision", () => {
  let grid: Tile[];

  // Layout 2x2:
  // (0,0) T0   (1,0) T2
  // (0,1) T1   (1,1) T3

  beforeEach(() => {
    const setup = createMockGrid(2, 2);
    grid = setup.tiles;
  });

  it("should detect collision with neighbor's bottom wall when moving SE diagonally", () => {
    const t0 = grid[0]; // (0,0)
    const t2 = grid[2]; // (1,0) Right neighbor of T0
    t2.addWall(2, false, true); // Add bottom wall to T2.

    // Bullet moves from T0 (90, 90) to T3 (110, 110).
    const walls = getWallsForTile(t0, 110, 110);
    expect(walls[2]).toBe(true);
  });

  it("should detect collision with neighbor's right wall when moving SE diagonally", () => {
    const t0 = grid[0]; // (0,0)
    const t1 = grid[1]; // (0,1) Bottom neighbor of T0
    t1.addWall(3, false, true);

    const walls = getWallsForTile(t0, 110, 110);
    expect(walls[3]).toBe(true);
  });

  it("should detect collision with both walls (corner) when moving SE diagonally", () => {
    const t0 = grid[0]; // (0,0)
    const t1 = grid[1]; // (0,1)
    const t2 = grid[2]; // (1,0)

    t2.addWall(2, false, true); // T2 Bottom
    t1.addWall(3, false, true); // T1 Right

    const walls = getWallsForTile(t0, 110, 110);
    expect(walls[2]).toBe(true);
    expect(walls[3]).toBe(true);
  });

  it("should detect collision with neighbor's top wall when moving NE diagonally", () => {
    const t1 = grid[1]; // (0,1)
    const t3 = grid[3]; // (1,1) Right neighbor of T1
    t3.addWall(0, false, true);

    const walls = getWallsForTile(t1, 110, 90);
    expect(walls[0]).toBe(true);
  });

  it("should NOT detect phantom left wall when hitting flat ceiling with vertical wall above (T-shape collision)", () => {
    const t3 = grid[3]; // Current (1,1)
    const t1 = grid[1]; // Left (0,1)
    const t2 = grid[2]; // Top (1,0)

    t3.addWall(0, false, true); // T3 Top (Ceiling)
    t1.addWall(0, false, true); // T1 Top (Ceiling extension)
    t2.addWall(1, false, true); // T2 Left (Vertical stem UP from corner)

    const walls = getWallsForTile(t3, 90, 90);
    expect(walls[0]).toBe(true);
    expect(walls[1]).toBe(false);
  });
});

describe("Grid Physics - checkRectMapCollision", () => {
  let setup: { map: GameMap; tiles: Tile[] };
  let map: GameMap;

  beforeEach(() => {
    setup = createMockGrid(3, 3);
    map = setup.map;
  });

  it("should detect no collision for rect inside empty tile", () => {
    const rectCorners: Coord[] = [
      { x: 140, y: 140 },
      { x: 160, y: 140 },
      { x: 160, y: 160 },
      { x: 140, y: 160 },
    ];
    const center = { x: 150, y: 150 }; // Tile 4 (1,1)

    const result = checkRectMapCollision(map, rectCorners, center);
    expect(result).toBe(-1);
  });

  it("should detect collision when rect corner crosses a wall", () => {
    const tile = setup.tiles[4]; // (1,1)
    tile.addWall(0); // Top wall

    const rectCorners: Coord[] = [
      { x: 140, y: 90 }, // This corner is above the wall (y < 100)
      { x: 160, y: 90 },
      { x: 160, y: 110 },
      { x: 140, y: 110 },
    ];
    const center = { x: 150, y: 100 };

    const result = checkRectMapCollision(map, rectCorners, center);
    expect(result).toBe(0); // Index 0 is hitting
  });
});
