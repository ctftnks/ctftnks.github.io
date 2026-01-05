import { mount, enableAutoUnmount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { reactive } from "vue";
import MenuPage from "@/ui/components/MenuPage.vue";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import { TEAMS } from "@/game/team";
import { openPage } from "@/stores/ui";

enableAutoUnmount(afterEach);

// Mock dependencies
vi.mock("@/stores/gamestore", () => ({
  store: {
    players: [],
    keymaps: [[], [], [], []],
    game: {
      paused: false,
    },
    createPlayer: vi.fn(),
    startNewGame: vi.fn(),
    saveSettings: vi.fn(),
  },
}));

vi.mock("@/stores/settings", () => ({
  Settings: reactive({
    muted: true,
    GameMode: "CTF",
    BotSpeed: 1,
  }),
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
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

  it("toggles mute status", async () => {
    const wrapper = mount(MenuPage);
    const muteBtn = wrapper.find("#btnMute");

    expect(Settings.muted).toBe(true);
    expect(muteBtn.text()).toBe("Sound: off");

    await muteBtn.trigger("click");

    expect(Settings.muted).toBe(false);
    expect(muteBtn.text()).toBe("Sound: on");
    expect(store.saveSettings).toHaveBeenCalled();
  });

  it("removes a player", async () => {
    const mockPlayer = { id: 123, name: "P1", team: TEAMS[0], isBot: () => false };
    store.players = [mockPlayer] as any;
    const wrapper = mount(MenuPage);

    await wrapper.find(".remove").trigger("click");

    expect(store.players).not.toContain(mockPlayer);
  });

  it("changes player team", async () => {
    const mockPlayer = { id: 1, name: "P1", team: TEAMS[0], isBot: () => false };
    store.players = [mockPlayer] as any;
    const wrapper = mount(MenuPage);

    await wrapper.find(".team").trigger("click");

    expect(mockPlayer.team).not.toBe(TEAMS[0]);
  });

  it("edits player name", async () => {
    const mockPlayer = { id: 1, name: "P1", team: TEAMS[0], isBot: () => false };
    store.players = [mockPlayer] as any;
    const wrapper = mount(MenuPage);
    vi.stubGlobal("prompt", vi.fn().mockReturnValue("NewName"));

    // Find the name button in the player row (not the header)
    await wrapper.find("#playersMenu .entry:nth-child(2) .name").trigger("click");

    expect(window.prompt).toHaveBeenCalled();
    expect(mockPlayer.name).toBe("NewName");
    vi.unstubAllGlobals();
  });

  it("edits keymap on keydown", async () => {
    const mockPlayer = { id: 0, name: "P1", team: TEAMS[0], isBot: () => false };
    store.players = [mockPlayer] as any;
    store.keymaps[0] = ["KeyW", "KeyA", "KeyS", "KeyD", "Space"];
    const wrapper = mount(MenuPage);

    // Start editing first key (Up) of first player
    await wrapper.find("#playersMenu .entry:nth-child(2) .keyEditButton").trigger("click");

    // Simulate keydown
    const event = new KeyboardEvent("keydown", { code: "ArrowUp" });
    window.dispatchEvent(event);

    expect(store.keymaps[0][0]).toBe("ArrowUp");
  });

  it("starts game and dispatches resize", async () => {
    const wrapper = mount(MenuPage);
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");

    await wrapper.find("#btnStartGame").trigger("click");

    expect(store.startNewGame).toHaveBeenCalled();
    expect(openPage).toHaveBeenCalledWith("game");
    expect(dispatchSpy).toHaveBeenCalledWith(expect.any(Event));
  });
});
