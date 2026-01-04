import { describe, it, expect, vi, beforeEach } from "vitest";
import { gameEvents, EVENTS } from "@/game/events";

describe("EventEmitter (gameEvents)", () => {
  beforeEach(() => {
    // EventEmitter doesn't have a clear all method, so we might need to be careful
    // with cross-test contamination if we don't use new functions every time.
  });

  it("should register and trigger listeners", () => {
    const callback = vi.fn();
    gameEvents.on("test-event", callback);

    gameEvents.emit("test-event", { foo: "bar" });

    expect(callback).toHaveBeenCalledWith({ foo: "bar" });

    // Cleanup
    gameEvents.off("test-event", callback);
  });

  it("should support multiple listeners for the same event", () => {
    const cb1 = vi.fn();
    const cb2 = vi.fn();
    gameEvents.on("multi-test", cb1);
    gameEvents.on("multi-test", cb2);

    gameEvents.emit("multi-test", 123);

    expect(cb1).toHaveBeenCalledWith(123);
    expect(cb2).toHaveBeenCalledWith(123);

    // Cleanup
    gameEvents.off("multi-test", cb1);
    gameEvents.off("multi-test", cb2);
  });

  it("should remove listeners correctly", () => {
    const callback = vi.fn();
    gameEvents.on("remove-test", callback);
    gameEvents.off("remove-test", callback);

    gameEvents.emit("remove-test", "data");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle emitting events with no listeners", () => {
    expect(() => {
      gameEvents.emit("non-existent-event", "some-data");
    }).not.toThrow();
  });

  it("should handle removing listeners for non-existent events", () => {
    const callback = vi.fn();
    expect(() => {
      gameEvents.off("no-event", callback);
    }).not.toThrow();
  });

  it("should have expected event constants", () => {
    expect(EVENTS.TIME_UPDATED).toBe("timeUpdated");
    expect(EVENTS.BOT_SPEED_UPDATED).toBe("botSpeedUpdated");
    expect(EVENTS.SCORE_UPDATED).toBe("scoreUpdated");
  });
});
