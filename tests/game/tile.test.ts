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
});
