import { mount, enableAutoUnmount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import GameView from "@/ui/components/GameView.vue";
import { store } from "@/stores/gamestore";
import Canvas from "@/game/canvas";

enableAutoUnmount(afterEach);

// Mock Canvas
vi.mock("@/game/canvas", () => {
  return {
    default: vi.fn(function (this: any) {
      this.resize = vi.fn();
    }),
  };
});

// Mock Store
vi.mock("@/stores/gamestore", () => ({
  store: {
    canvas: undefined,
    game: undefined,
    players: [],
    createPlayer: vi.fn().mockReturnValue({ team: { color: "red" } }),
    initDefaultPlayers: vi.fn(),
    startNewGame: vi.fn(),
  },
}));

describe("GameView.vue", () => {
  beforeEach(() => {
    store.canvas = undefined;
    store.game = undefined;
    store.players = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders canvases correctly", () => {
    const wrapper = mount(GameView);
    expect(wrapper.find(".game-canvas").exists()).toBe(true);
    expect(wrapper.find(".effects-canvas").exists()).toBe(true);
  });

  it("initializes canvas and game on mount", () => {
    mount(GameView);
    expect(Canvas).toHaveBeenCalled();
    expect(store.canvas).toBeDefined();
    // Verify players are created if empty
    expect(store.initDefaultPlayers).toHaveBeenCalled();
    expect(store.startNewGame).toHaveBeenCalled();
  });

  it("cleans up on unmount", () => {
    const wrapper = mount(GameView);
    // Simulate game being set
    store.game = { stop: vi.fn() } as any;

    wrapper.unmount();

    expect(store.game).toBeUndefined();
    expect(store.canvas).toBeUndefined();
  });
});
