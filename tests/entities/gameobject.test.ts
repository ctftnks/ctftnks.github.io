import { describe, it, expect } from "vitest";
import GameObject from "@/entities/gameobject";

// Create a concrete class for testing the abstract GameObject
class TestObject extends GameObject {
  draw(_ctx: CanvasRenderingContext2D) {}
}

describe("GameObject Class", () => {
  it("should initialize with default values", () => {
    const obj = new TestObject();
    expect(obj.x).toBe(0);
    expect(obj.y).toBe(0);
    expect(obj.width).toBe(0);
    expect(obj.isDeleted()).toBe(false);
  });

  it("should mark as deleted when delete() is called", () => {
    const obj = new TestObject();
    obj.delete();
    expect(obj.isDeleted()).toBe(true);
  });

  it("should have a default step method that does nothing", () => {
    const obj = new TestObject();
    expect(() => obj.step(0)).not.toThrow();
  });
});
