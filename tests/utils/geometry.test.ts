import { describe, it, expect } from "vitest";
import { isPointInRectangle, getRotatedCorners, circlesIntersect } from "@/utils/geometry";

describe("Geometry Utils", () => {
  describe("isPointInRectangle", () => {
    it("should return true for a point inside an axis-aligned rectangle", () => {
      // 100x100 rectangle at (50, 50) -> TL(0,0), TR(100,0), BL(0,100), BR(100,100)
      // But getRotatedCorners returns: 0:TL, 1:TR, 2:BL, 3:BR.
      // Wait, let's verify getRotatedCorners output for angle 0.
      const corners = [
        { x: 0, y: 0 }, // A
        { x: 100, y: 0 }, // B
        { x: 0, y: 100 }, // D
        { x: 100, y: 100 }, // C (unused by check)
      ];

      expect(isPointInRectangle({ x: 50, y: 50 }, corners)).toBe(true);
      expect(isPointInRectangle({ x: 10, y: 10 }, corners)).toBe(true);
      expect(isPointInRectangle({ x: 90, y: 90 }, corners)).toBe(true);
    });

    it("should return false for a point outside", () => {
      const corners = [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
      ];

      expect(isPointInRectangle({ x: -10, y: 50 }, corners)).toBe(false);
      expect(isPointInRectangle({ x: 110, y: 50 }, corners)).toBe(false);
      expect(isPointInRectangle({ x: 50, y: -10 }, corners)).toBe(false);
      expect(isPointInRectangle({ x: 50, y: 110 }, corners)).toBe(false);
    });

    it("should handle rotated rectangles", () => {
      // Rotate 45 degrees (PI/4). Center (0,0). Width 2, Height 2.
      // Corners should be at distance sqrt(2) from center.
      // (0, sqrt(2)), (sqrt(2), 0), (-sqrt(2), 0), (0, -sqrt(2))?
      // Let's use getRotatedCorners to generate valid corners.
      const corners = getRotatedCorners(0, 0, 2, 2, Math.PI / 4);

      // Point (0,0) should be inside
      expect(isPointInRectangle({ x: 0, y: 0 }, corners)).toBe(true);

      // Point (0.9, 0) should be inside (dist 0.9 < 1? No, side is 2? Half-width is 1.)
      // Rectangle is rotated. Original square [-1,1]x[-1,1].
      // Rotated 45 deg.
      // Tips are at radius sqrt(2) ~= 1.414.
      // (0, 1.4) is inside?
      // Distance from center to edge is 1 / cos(45)?? No.
      // Let's stick to obvious points.

      // (2, 2) definitely outside.
      expect(isPointInRectangle({ x: 2, y: 2 }, corners)).toBe(false);
    });
  });

  describe("getRotatedCorners", () => {
    it("should calculate corners for 0 rotation (axis aligned)", () => {
      const x = 50,
        y = 50,
        w = 100,
        h = 100;
      const corners = getRotatedCorners(x, y, w, h, 0);

      // Expected:
      // TL: 0, 0
      // TR: 100, 0
      // BL: 0, 100
      // BR: 100, 100
      // Order from function:
      // 0: x - w/2, y - h/2 -> 0, 0 (TL) (Wait, function: y + w/2*sin - h/2*cos -> 50 + 0 - 50 = 0)
      // 1: x + w/2, y - h/2 -> 100, 0 (TR)
      // 2: x - w/2, y + h/2 -> 0, 100 (BL)
      // 3: x + w/2, y + h/2 -> 100, 100 (BR)

      expect(corners[0]).toEqual({ x: 0, y: 0 });
      expect(corners[1]).toEqual({ x: 100, y: 0 });
      expect(corners[2]).toEqual({ x: 0, y: 100 });
      expect(corners[3]).toEqual({ x: 100, y: 100 });
    });

    it("should calculate corners for 90 degree rotation", () => {
      // 90 deg = PI/2.
      // cos=0, sin=1.
      const x = 0,
        y = 0,
        w = 10,
        h = 2;
      // Long horizontal bar becomes vertical bar.
      const corners = getRotatedCorners(x, y, w, h, Math.PI / 2);

      // 0: x - 5*0 - 1*1 = -1.  y + 5*1 - 1*0 = 5.   -> (-1, 5)
      // 1: x + 5*0 - 1*1 = -1.  y - 5*1 - 1*0 = -5.  -> (-1, -5)
      // 2: x - 5*0 + 1*1 = 1.   y + 5*1 + 1*0 = 5.   -> (1, 5)
      // 3: x + 5*0 + 1*1 = 1.   y - 5*1 + 1*0 = -5.  -> (1, -5)

      expect(corners[0].x).toBeCloseTo(-1);
      expect(corners[0].y).toBeCloseTo(5);
      expect(corners[1].x).toBeCloseTo(-1);
      expect(corners[1].y).toBeCloseTo(-5);
      expect(corners[2].x).toBeCloseTo(1);
      expect(corners[2].y).toBeCloseTo(5);
      expect(corners[3].x).toBeCloseTo(1);
      expect(corners[3].y).toBeCloseTo(-5);
    });
  });

  describe("circlesIntersect", () => {
    it("should return true if circles overlap", () => {
      const c1 = { x: 0, y: 0 };
      const c2 = { x: 5, y: 0 };
      // Dist 5. Radii 3 and 3. Sum 6. 5 < 6.
      expect(circlesIntersect(c1, 3, c2, 3)).toBe(true);
    });

    it("should return true if circles touch", () => {
      const c1 = { x: 0, y: 0 };
      const c2 = { x: 6, y: 0 };
      // Dist 6. Radii 3 and 3. Sum 6.
      expect(circlesIntersect(c1, 3, c2, 3)).toBe(true);
    });

    it("should return false if circles are disjoint", () => {
      const c1 = { x: 0, y: 0 };
      const c2 = { x: 10, y: 0 };
      expect(circlesIntersect(c1, 3, c2, 3)).toBe(false);
    });
  });
});
