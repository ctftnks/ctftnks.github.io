import { type Coord, isPointInRectangle } from "./geometry";
import type GameMap from "@/game/gamemap";
import type Tile from "@/game/tile";

/**
 * Checks for walls between a tile and a point (x,y).
 * This logic handles detecting if a point has crossed a wall relative to the given tile.
 * @param tile - The reference tile (usually where the object WAS).
 * @param x - The new X coordinate.
 * @param y - The new Y coordinate.
 * @returns Array of booleans [top, left, bottom, right] indicating collision.
 */
export function getWallsForTile(tile: Tile, x: number, y: number): boolean[] {
  const { x: tx, y: ty, dx, dy, walls, neighbors } = tile;
  const distx = tx - x;
  const disty = ty - y;
  const collisionFlags = [false, false, false, false];

  // Determine relative position
  const isLeft = distx > 0;
  const isRight = distx < -dx;
  const isTop = disty > 0;
  const isBottom = disty < -dy;

  // Check direct walls
  if (isTop && walls[0]) {
    collisionFlags[0] = true;
  }
  if (isLeft && walls[1]) {
    collisionFlags[1] = true;
  }
  if (isBottom && walls[2]) {
    collisionFlags[2] = true;
  }
  if (isRight && walls[3]) {
    collisionFlags[3] = true;
  }

  // Check corner cases (diagonal neighbors)
  if (isTop) {
    if (isLeft) {
      // Top-Left Corner
      if (!walls[1] && neighbors[1]?.walls[0]) {
        collisionFlags[0] = true;
      }
      if (!walls[0] && neighbors[0]?.walls[1]) {
        collisionFlags[1] = true;
      }
    } else if (isRight) {
      // Top-Right Corner
      if (!walls[3] && neighbors[3]?.walls[0]) {
        collisionFlags[0] = true;
      }
      if (!walls[0] && neighbors[0]?.walls[3]) {
        collisionFlags[3] = true;
      }
    }
  } else if (isBottom) {
    if (isLeft) {
      // Bottom-Left Corner
      if (!walls[1] && neighbors[1]?.walls[2]) {
        collisionFlags[2] = true;
      }
      if (!walls[2] && neighbors[2]?.walls[1]) {
        collisionFlags[1] = true;
      }
    } else if (isRight) {
      // Bottom-Right Corner
      if (!walls[3] && neighbors[3]?.walls[2]) {
        collisionFlags[2] = true;
      }
      if (!walls[2] && neighbors[2]?.walls[3]) {
        collisionFlags[3] = true;
      }
    }
  }

  return collisionFlags;
}

/**
 * Checks collision for a generic rectangular object against the map walls.
 * @param map - The game map.
 * @param rectCorners - The 4 corners of the rectangle.
 * @param center - The center of the rectangle (used to find the current tile).
 * @returns The index of the colliding corner (0-3), 5 if a wall corner is inside, or -1 if no collision.
 */
export function checkRectMapCollision(map: GameMap, rectCorners: Coord[], center: Coord): number {
  const centerTile = map.getTileByPos(center.x, center.y);
  if (!centerTile) {
    return -1;
  }

  // 1. Check if any rect corner crossed a wall relative to the center tile
  for (let k = 0; k < rectCorners.length; k++) {
    const corner = rectCorners[k];
    const walls = getWallsForTile(centerTile, corner.x, corner.y);
    if (walls[0] || walls[1] || walls[2] || walls[3]) {
      return k;
    }
  }

  // 2. Check if any wall corner of the current tile is inside the rectangle
  const wallCorners = centerTile.corners();
  for (const wc of wallCorners) {
    if (wc.w && isPointInRectangle(wc, rectCorners)) {
      return 5;
    }
  }
  return -1;
}
