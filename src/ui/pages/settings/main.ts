import template from "./main.html?raw";
import "./style.css";
import { Settings } from "@/game/store";
import { databinding } from "@/ui/databinding";
import { closePage } from "@/ui/pages";

export function init(container: HTMLElement): void {
  container.innerHTML = template;

  const shade = container.querySelector("#settingsShade");
  if (shade) {
    shade.addEventListener("click", () => closePage(container));
  }

  const menu = container.querySelector("#settingsMenu");
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
