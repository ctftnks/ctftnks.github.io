import { mount, enableAutoUnmount } from "@vue/test-utils";
import { describe, it, expect, vi, afterEach } from "vitest";
import SettingsPage from "@/ui/components/SettingsPage.vue";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { Settings } from "@/stores/settings";

enableAutoUnmount(afterEach);

// Mock dependencies
vi.mock("@/stores/gamestore", () => ({
  store: {
    saveSettings: vi.fn(),
  },
}));

vi.mock("@/stores/ui", () => ({
  openPage: vi.fn(),
}));

describe("SettingsPage.vue", () => {
  it("renders correctly", () => {
    const wrapper = mount(SettingsPage);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find("h2").text()).toBe("Settings");
  });

  it("updates setting when button is clicked", async () => {
    const wrapper = mount(SettingsPage);
    const initialSpeed = Settings.TankSpeed;
    const plusBtn = wrapper.findAll("button.right")[0]; // First + button (Tank Speed)

    await plusBtn.trigger("click");

    expect(Settings.TankSpeed).toBe(initialSpeed + 20);
    expect(store.saveSettings).toHaveBeenCalled();
  });

  it("closes settings page", async () => {
    const wrapper = mount(SettingsPage);
    const shade = wrapper.find("#settingsShade");

    await shade.trigger("click");

    expect(openPage).toHaveBeenCalledWith("menu");
  });

  it("resets settings to defaults", async () => {
    const wrapper = mount(SettingsPage);
    const resetBtn = wrapper.find("#btnResetSettings");

    // Change a setting
    Settings.TankSpeed = 999;
    expect(Settings.TankSpeed).toBe(999);

    await resetBtn.trigger("click");

    expect(Settings.TankSpeed).toBe(200); // Default value
    expect(store.saveSettings).toHaveBeenCalled();
  });

  it("updates boolean setting via select", async () => {
    const wrapper = mount(SettingsPage);
    const select = wrapper.find("select"); // First select (Show tank labels)

    await select.setValue(false);

    expect(Settings.ShowTankLabels).toBe(false);
    expect(store.saveSettings).toHaveBeenCalled();
  });

  it("updates numeric setting with min value constraint", async () => {
    const wrapper = mount(SettingsPage);
    Settings.MapNxMin = 2; // Set to min

    // Wait, nth-of-type(6) might be tricky. Let's find by text.
    const options = wrapper.findAll(".option");
    const minSizeOption = options.find((o) => o.text().includes("Map min-size"))!;
    const minus = minSizeOption.find("button.left");

    await minus.trigger("click");

    expect(Settings.MapNxMin).toBe(2); // Should not go below 2
  });

  it("updates sound setting via select", async () => {
    const wrapper = mount(SettingsPage);
    const options = wrapper.findAll(".option");
    const soundOption = options.find((o) => o.text().includes("Sound"))!;
    const select = soundOption.find("select");

    await select.setValue(true); // muted = true
    expect(Settings.muted).toBe(true);

    await select.setValue(false); // muted = false
    expect(Settings.muted).toBe(false);
  });
});
