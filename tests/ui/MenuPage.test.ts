import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MenuPage from "@/ui/components/MenuPage.vue";
import { store } from "@/stores/gamestore";
import { TEAMS } from "@/game/team";
import { openPage } from "@/stores/ui";

// Mock dependencies
vi.mock("@/stores/gamestore", () => ({
  store: {
    players: [],
    keymaps: [[], [], [], []],
    game: {
      paused: false,
    },
    createPlayer: vi.fn(),
  },
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
}));

vi.mock("@/game/game", () => ({
  newGame: vi.fn(),
}));

describe("MenuPage.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    store.players = [];
  });

  it("renders correctly", () => {
    const wrapper = mount(MenuPage);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find("h1").text()).toBe("CTF Tanks");
  });

  it("adds a player when Add Player button is clicked", async () => {
    const wrapper = mount(MenuPage);
    const addPlayerBtn = wrapper.find("#btnAddPlayer");

    // Mock createPlayer return value
    const mockPlayer = { id: 0, name: "Player 1", team: TEAMS[0], isBot: () => false };
    (store.createPlayer as any).mockReturnValue(mockPlayer);

    await addPlayerBtn.trigger("click");

    expect(store.createPlayer).toHaveBeenCalledWith(false);
    expect(store.players).toContain(mockPlayer);
  });

  it("adds a bot when Add Bot button is clicked", async () => {
    const wrapper = mount(MenuPage);
    const addBotBtn = wrapper.find("#btnAddBot");

    const mockBot = { id: 1, name: "Bot 1", team: TEAMS[1], isBot: () => true };
    (store.createPlayer as any).mockReturnValue(mockBot);

    await addBotBtn.trigger("click");

    expect(store.createPlayer).toHaveBeenCalledWith(true);
    expect(store.players).toContain(mockBot);
  });

  it("navigates to settings page", async () => {
    const wrapper = mount(MenuPage);
    const settingsBtn = wrapper.find("#btnSettings");

    await settingsBtn.trigger("click");

    expect(openPage).toHaveBeenCalledWith("settings");
  });
});
