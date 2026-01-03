import { describe, it, expect, beforeEach } from "vitest";
import { Key } from "@/game/key";

describe("Key Handling", () => {
  beforeEach(() => {
    // Clear pressed keys before each test
    Key._pressed.clear();
  });

  it("should detect key down", () => {
    const event = { code: "KeyW", preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
    Key.onKeydown(event);
    expect(Key.isDown("KeyW")).toBe(true);
  });

  it("should detect key up", () => {
    const event = { code: "KeyW", preventDefault: () => {}, stopPropagation: () => {} } as KeyboardEvent;
    Key.onKeydown(event);
    expect(Key.isDown("KeyW")).toBe(true);

    Key.onKeyup(event);
    expect(Key.isDown("KeyW")).toBe(false);
  });

  it("should handle multiple keys", () => {
    const ev1 = { code: "ArrowUp" } as KeyboardEvent;
    const ev2 = { code: "Space" } as KeyboardEvent;

    Key.onKeydown(ev1);
    Key.onKeydown(ev2);

    expect(Key.isDown("ArrowUp")).toBe(true);
    expect(Key.isDown("Space")).toBe(true);
    expect(Key.isDown("ArrowDown")).toBe(false);
  });
});
