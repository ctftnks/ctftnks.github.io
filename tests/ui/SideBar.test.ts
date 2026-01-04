import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SideBar from "@/ui/components/SideBar.vue";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import { openPage } from "@/stores/ui";

// Mock dependencies
vi.mock("@/stores/gamestore", () => ({
  store: {
    players: [],
    game: {
      t: 0,
      resetTime: vi.fn(),
    },
    startNewGame: vi.fn(),
  },
}));

vi.mock("@/stores/settings", () => ({
  Settings: {
    RoundTime: 10,
    BotSpeed: 1,
  },
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
}));

describe("SideBar.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    store.players = [];
    if (store.game) store.game.t = 0;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly", () => {
    const wrapper = mount(SideBar);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.text()).toContain("Menu");
    expect(wrapper.text()).toContain("Scores");
    expect(wrapper.text()).toContain("Time");
  });

  it("displays correct time", async () => {
    Settings.RoundTime = 10;
    if (store.game) store.game.t = 60000; // 1 minute elapsed
    const wrapper = mount(SideBar);

    // Advance timers to trigger the polling (SideBar.vue uses 200ms)
    vi.advanceTimersByTime(200);
    await wrapper.vm.$nextTick();

    expect(wrapper.find("#GameTimer").text()).toBe("09:00");
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
    const timeBtn = entries.find((e) => e.text().includes("Time"));

    expect(timeBtn).toBeDefined();
    await timeBtn!.trigger("click");

    expect(store.game?.resetTime).toHaveBeenCalled();
  });

  it("starts next map when Next Map is clicked", async () => {
    const wrapper = mount(SideBar);
    const entries = wrapper.findAll(".entry.clickable");
    const nextMapBtn = entries.find((e) => e.text().includes("Next Map"));

    expect(nextMapBtn).toBeDefined();
    await nextMapBtn!.trigger("click");

    expect(store.startNewGame).toHaveBeenCalled();
  });
});
