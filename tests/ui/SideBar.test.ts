import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import SideBar from "@/ui/components/SideBar.vue";
import { store } from "@/stores/gamestore";
import { gameEvents, EVENTS } from "@/game/events";
import { openPage } from "@/stores/ui";
import { newGame } from "@/game/game";

// Mock dependencies
vi.mock("@/stores/store", () => ({
  store: {
    players: [],
    game: {
      resetTime: vi.fn(),
    },
  },
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
}));

vi.mock("@/game/game", () => ({
  newGame: vi.fn(),
}));

vi.mock("@/game/events", () => ({
  gameEvents: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  EVENTS: {
    TIME_UPDATED: "TIME_UPDATED",
    BOT_SPEED_UPDATED: "BOT_SPEED_UPDATED",
  },
}));

describe("SideBar.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.players = [];
  });

  it("renders correctly", () => {
    const wrapper = mount(SideBar);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Menu");
    expect(wrapper.text()).toContain("Scores");
    expect(wrapper.text()).toContain("Time");
  });

  it("opens menu when Menu is clicked", async () => {
    const wrapper = mount(SideBar);
    const menuBtn = wrapper.findAll(".entry.clickable")[0]; // "Menu" is the first clickable entry

    await menuBtn.trigger("click");

    expect(openPage).toHaveBeenCalledWith("menu");
  });

  it("resets time when Time is clicked", async () => {
    const wrapper = mount(SideBar);
    // "Time: ..." is the second clickable entry that has "Time" text
    const entries = wrapper.findAll(".entry.clickable");
    const timeBtn = entries.find(e => e.text().includes("Time"));

    expect(timeBtn).toBeDefined();
    await timeBtn!.trigger("click");

    expect(store.game.resetTime).toHaveBeenCalled();
  });

  it("starts next map when Next Map is clicked", async () => {
    const wrapper = mount(SideBar);
    const entries = wrapper.findAll(".entry.clickable");
    const nextMapBtn = entries.find(e => e.text().includes("Next Map"));

    expect(nextMapBtn).toBeDefined();
    await nextMapBtn!.trigger("click");

    expect(newGame).toHaveBeenCalled();
  });

  it("registers event listeners on mount", () => {
    mount(SideBar);
    expect(gameEvents.on).toHaveBeenCalledWith(EVENTS.TIME_UPDATED, expect.any(Function));
    expect(gameEvents.on).toHaveBeenCalledWith(EVENTS.BOT_SPEED_UPDATED, expect.any(Function));
  });

  it("unregisters event listeners on unmount", () => {
    const wrapper = mount(SideBar);
    wrapper.unmount();
    expect(gameEvents.off).toHaveBeenCalledWith(EVENTS.TIME_UPDATED, expect.any(Function));
    expect(gameEvents.off).toHaveBeenCalledWith(EVENTS.BOT_SPEED_UPDATED, expect.any(Function));
  });
});
