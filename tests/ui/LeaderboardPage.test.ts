import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import LeaderboardPage from "@/ui/components/LeaderboardPage.vue";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { newGame } from "@/game/game";
import { Settings } from "@/stores/settings";

// Mock dependencies
vi.mock("@/stores/store", () => ({
  store: {
    GameID: 1,
    players: [],
  },
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
}));

vi.mock("@/game/game", () => ({
  newGame: vi.fn(),
}));

describe("LeaderboardPage.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Settings.EndScreenTime = 10;
    store.players = [
        { id: 1, name: "P1", score: 100, stats: { kills: 1, deaths: 0, shots: 10, miles: 500 } },
        { id: 2, name: "P2", score: 50, stats: { kills: 0, deaths: 1, shots: 5, miles: 200 } }
    ] as any;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders correctly", () => {
    const wrapper = mount(LeaderboardPage);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find("h2").text()).toContain("Leaderboard");
    expect(wrapper.text()).toContain("P1");
    expect(wrapper.text()).toContain("P2");
  });

  it("sorts players by score", () => {
    store.players = [
        { id: 2, name: "P2", score: 50, stats: { kills: 0, deaths: 1, shots: 5, miles: 200 } },
        { id: 1, name: "P1", score: 100, stats: { kills: 1, deaths: 0, shots: 10, miles: 500 } }
    ] as any;

    const wrapper = mount(LeaderboardPage);
    const rows = wrapper.findAll("tbody tr");
    
    // First row should be P1 (higher score)
    expect(rows[0].text()).toContain("P1");
    expect(rows[1].text()).toContain("P2");
  });

  it("starts new game on click", async () => {
    const wrapper = mount(LeaderboardPage);
    const shade = wrapper.find("#leaderboardshade");

    await shade.trigger("click");

    expect(newGame).toHaveBeenCalled();
    expect(openPage).toHaveBeenCalledWith("game");
  });

  it("starts new game after timeout", () => {
    mount(LeaderboardPage);
    
    vi.advanceTimersByTime(10000); // 10s

    expect(newGame).toHaveBeenCalled();
    expect(openPage).toHaveBeenCalledWith("game");
  });
});
