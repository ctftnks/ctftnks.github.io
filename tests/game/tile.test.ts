import { describe, it, expect, beforeEach, vi } from "vitest";
import Tile from "@/game/tile";
import GameMap from "@/game/gamemap";
import GameObject from "@/entities/gameobject";

// Create a simple mock map with manually linked tiles
function createMockGrid(width: number, height: number): { map: GameMap; tiles: Tile[] } {
  const mockMap = {
    Nx: width,
    Ny: height,
    dx: 100,
    dy: 100,
    tiles: [],
    getTileByIndex: vi.fn(),
  } as unknown as GameMap;

  const tiles: Tile[] = [];
  // Initialize tiles
  for (let i = 0; i < width; i++) {
    for (let j = 0; j < height; j++) {
      tiles.push(new Tile(i, j, mockMap));
    }
  }

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

describe("Tile Pathfinding", () => {
  let grid: Tile[];

  beforeEach(() => {
    const setup = createMockGrid(3, 3);
    grid = setup.tiles;
    // Layout 3x3:
    // 0 3 6
    // 1 4 7
    // 2 5 8
  });

  it("should find the shortest path between adjacent tiles", () => {
    const start = grid[0]; // (0,0)
    const end = grid[3]; // (1,0)

    const path = start.pathTo((t) => t === end);

    expect(path).not.toBeNull();
    expect(path!.length).toBe(2);
    expect(path![0]).toBe(start);
    expect(path![1]).toBe(end);
  });

  it("should find path around walls", () => {
    // 0 3 6
    // 1 4 7
    // 2 5 8

    // Block direct path from 0 to 3
    grid[0].addWall(3); // Right wall of (0,0)

    // Should go 0 -> 1 -> 4 -> 3
    const start = grid[0];
    const end = grid[3];

    const path = start.pathTo((t) => t === end);

    expect(path).not.toBeNull();
    // Path: 0, 1, 4, 3 (4 tiles)
    expect(path!.length).toBe(4);
    expect(path).toEqual([grid[0], grid[1], grid[4], grid[3]]);
  });

  it("should return null if no path exists", () => {
    // Isolate tile 0 completely
    grid[0].addWall(0); // top (border)
    grid[0].addWall(1); // left (border)
    grid[0].addWall(2); // bottom
    grid[0].addWall(3); // right

    const start = grid[0];
    const end = grid[8];

    const path = start.pathTo((t) => t === end);
    expect(path).toBeNull();
  });

  it("should respect maxPathLength", () => {
    const start = grid[0];
    const end = grid[8]; // (2,2) - min distance is 5 tiles (0->3->6->7->8) or (0->1->2->5->8) etc.
    // 0(0,0) -> 3(1,0) -> 6(2,0) -> 7(2,1) -> 8(2,2) = 5 steps

    // If max length is 3, it should fail
    const path = start.pathTo((t) => t === end, [], null, 3);
    expect(path).toBeNull();
  });
});

describe("Tile Object Pathfinding", () => {
  let grid: Tile[];

  beforeEach(() => {
    const setup = createMockGrid(3, 3);
    grid = setup.tiles;
  });

  it("should find path to an object matching condition", () => {
    const start = grid[0];
    const targetTile = grid[4]; // Center

    const mockObj = { id: "target" } as unknown as GameObject;
    targetTile.objs.push(mockObj);

    const path = start.xypathToObj((obj) => (obj as any).id === "target");

    expect(path).not.toBeNull();
    // Path should contain coordinates + the object at the end
    // 0 -> 1 -> 4 or 0 -> 3 -> 4. Length 3 tiles -> 3 coords + 1 obj = 4 items
    expect(path!.length).toBe(4);
    expect(path![3]).toBe(mockObj);
  });
});

describe("Tile Random Walk", () => {
  let grid: Tile[];

  beforeEach(() => {
    const setup = createMockGrid(3, 3);
    grid = setup.tiles;
  });

  it("should return same tile for 0 distance", () => {
    const start = grid[4];
    expect(start.randomWalk(0)).toBe(start);
  });

  it("should move to a valid neighbor", () => {
    const start = grid[4]; // Center, has 4 neighbors
    const end = start.randomWalk(1);

    expect(end).not.toBe(start);
    expect(start.neighbors).toContain(end);
  });

  it("should return self if stuck", () => {
    const start = grid[0];
    // Block all exits
    start.addWall(0, false, false);
    start.addWall(1, false, false);
    start.addWall(2, false, false);
    start.addWall(3, false, false);

    expect(start.randomWalk(1)).toBe(start);
  });
});

describe("Tile Visuals and Walls", () => {
  let grid: Tile[];

  beforeEach(() => {
    const setup = createMockGrid(3, 3);
    grid = setup.tiles;
  });

  it("should return 4 corners with wall info", () => {
    const tile = grid[0];
    tile.walls = [true, false, false, false]; // top wall
    const corners = tile.corners();

    expect(corners.length).toBe(4);
    expect(corners[0].w).toBe(true); // top-left corner is part of top wall
    expect(corners[3].w).toBe(true); // top-right corner is part of top wall
    expect(corners[1].w).toBe(false); // bottom corners are not
  });

  it("should draw walls correctly", () => {
    const tile = grid[4];
    tile.walls = [true, true, true, true];
    const mockContext = {
      fillRect: vi.fn(),
      fillStyle: "",
    } as any;

    tile.draw(mockContext);
    expect(mockContext.fillRect).toHaveBeenCalledTimes(4);
    expect(mockContext.fillStyle).toBe("#555");
  });

  it("should update neighbors when adding/removing walls", () => {
    const t1 = grid[0]; // (0,0)
    const t2 = grid[1]; // (0,1) - bottom neighbor of t1

    t1.addWall(2, false, true); // add bottom wall to t1
    expect(t1.walls[2]).toBe(true);
    expect(t2.walls[0]).toBe(true); // top wall of t2 should also be set

    t1.addWall(2, true, true); // remove it
    expect(t1.walls[2]).toBe(false);
    expect(t2.walls[0]).toBe(false);
  });

  it("should identify walls between tile and a point", () => {
    const tile = grid[4]; // Center at (100, 100), size 100x100
    tile.x = 100;
    tile.y = 100;
    tile.dx = 100;
    tile.dy = 100;
    tile.walls = [true, true, true, true];

    // Point above tile
    const wallsTop = tile.getWalls(150, 50);
    expect(wallsTop[0]).toBe(true);

    // Point left of tile
    const wallsLeft = tile.getWalls(50, 150);
    expect(wallsLeft[1]).toBe(true);

    // Point below tile
    const wallsBottom = tile.getWalls(150, 250);
    expect(wallsBottom[2]).toBe(true);

    // Point right of tile
    const wallsRight = tile.getWalls(250, 150);
    expect(wallsRight[3]).toBe(true);
  });
});
