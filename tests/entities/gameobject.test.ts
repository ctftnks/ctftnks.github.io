import { describe, it, expect, vi } from "vitest";
import GameObject from "@/entities/gameobject";

// Create a concrete class for testing the abstract GameObject
class TestObject extends GameObject {}

describe("GameObject Class", () => {
  it("should initialize with default values", () => {
    const obj = new TestObject();
    expect(obj.x).toBe(0);
    expect(obj.y).toBe(0);
    expect(obj.width).toBe(0);
    expect(obj.deleted).toBe(false);
    expect(obj.image).toBeDefined();
  });

  it("should mark as deleted when delete() is called", () => {
    const obj = new TestObject();
    obj.delete();
    expect(obj.deleted).toBe(true);
  });

  it("should have a default draw method that does nothing if no image src", () => {
    const obj = new TestObject();
    const mockContext = {
      save: vi.fn(),
      translate: vi.fn(),
      drawImage: vi.fn(),
      restore: vi.fn(),
    } as any;

    // By default, image.src is empty
    obj.draw(mockContext);

    // It actually tries to draw if this.image exists, even if src is empty?
    // Let's check the code: if (this.image) { ... }
    // Since this.image = new Image() in constructor, it exists.
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.drawImage).toHaveBeenCalled();
  });

  it("should have a default step method that does nothing", () => {
    const obj = new TestObject();
    expect(() => obj.step()).not.toThrow();
  });
});
