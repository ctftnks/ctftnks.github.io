import { BasePage } from "@/ui/BasePage";
import template from "./main.html?raw";
import "./style.css";
import { Settings } from "@/game/settings";
import { databinding } from "@/ui/databinding";
import { closePage } from "@/ui/pages";

/**
 * SettingsPage - Component for editing game settings.
 * @augments BasePage
 */
class SettingsPage extends BasePage {
  /**
   * Renders the settings menu template.
   */
  protected render(): void {
    this.innerHTML = template;
  }

  /**
   * Attaches event listeners for closing the page and updating settings.
   */
  protected attachListeners(): void {
    const shade = this.querySelector("#settingsShade");
    if (shade) {
      shade.addEventListener("click", () => closePage(this));
    }

    const menu = this.querySelector("#settingsMenu");
    if (menu) {
      menu.addEventListener("click", (event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === "BUTTON") {
          const action = target.getAttribute("data-action");
          if (action === "updateSetting") {
            const key = target.getAttribute("data-key");
            const delta = parseFloat(target.getAttribute("data-delta") || "0");
            if (key && !isNaN(delta) && key in Settings) {
              (Settings as any)[key] += delta;
              databinding();
            }
          }
        }
      });
    }
  }

  /**
   * Refreshes data binding on mount.
   */
  protected onMount(): void {
    databinding();
  }
}

customElements.define("settings-page", SettingsPage);
