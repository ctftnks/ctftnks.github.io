import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import SettingsPage from "@/ui/components/SettingsPage.vue";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { Settings } from "@/stores/settings";

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
});
