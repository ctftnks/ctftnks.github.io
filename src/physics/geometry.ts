/** Interface for anything that has (x, y) coordinates */
export interface Coord {
  x: number;
  y: number;
}

/**
 * Checks if a point is inside a rectangle defined by 4 corners.
 * Assumes convex shape (rectangle).
 * Uses the dot product method (0 < AM*AB < AB*AB etc.)
 * @param point - The point to check.
 * @param corners - The 4 corners of the rectangle.
 * @returns True if the point is inside.
 */
export function isPointInRectangle(point: Coord, corners: Coord[]): boolean {
  const A = corners[0];
  const B = corners[1];
  const D = corners[2];
  const AMAB = (A.x - point.x) * (A.x - B.x) + (A.y - point.y) * (A.y - B.y);
  const AMAD = (A.x - point.x) * (A.x - D.x) + (A.y - point.y) * (A.y - D.y);
  const ABAB = (A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y);
  const ADAD = (A.x - D.x) * (A.x - D.x) + (A.y - D.y) * (A.y - D.y);
  return 0 < AMAB && AMAB < ABAB && 0 < AMAD && AMAD < ADAD;
}

/**
 * Calculates the corners of a rotated rectangle.
 * @param x - Center X.
 * @param y - Center Y.
 * @param width - Width.
 * @param height - Height.
 * @param angle - Rotation angle in radians.
 * @returns Array of 4 corners {x, y}.
 */
export function getRotatedCorners(x: number, y: number, width: number, height: number, angle: number): Coord[] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    {
      x: x - (width / 2) * cos - (height / 2) * sin,
      y: y + (width / 2) * sin - (height / 2) * cos,
    },
    {
      x: x + (width / 2) * cos - (height / 2) * sin,
      y: y - (width / 2) * sin - (height / 2) * cos,
    },
    {
      x: x - (width / 2) * cos + (height / 2) * sin,
      y: y + (width / 2) * sin + (height / 2) * cos,
    },
    {
      x: x + (width / 2) * cos + (height / 2) * sin,
      y: y - (width / 2) * sin + (height / 2) * cos,
    },
  ];
}

/**
 * Checks if two circles intersect.
 * @param c1 - Center of first circle.
 * @param r1 - Radius of first circle.
 * @param c2 - Center of second circle.
 * @param r2 - Radius of second circle.
 * @returns True if they intersect.
 */
export function circlesIntersect(c1: Coord, r1: number, c2: Coord, r2: number): boolean {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const rSum = r1 + r2;
  return dx * dx + dy * dy <= rSum * rSum;
}
