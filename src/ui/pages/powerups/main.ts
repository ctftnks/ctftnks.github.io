import { PowerUps } from "@/entities/powerup";
import template from "./main.html?raw";
import "./style.css";
import { Settings } from "@/game/store";
import { databinding } from "@/ui/databinding";
import { closePage } from "@/ui/pages";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updatePowerupsMenu();

  const shade = container.querySelector("#powerupsShade");
  if (shade) {
    shade.addEventListener("click", () => closePage(container));
  }

  const btnClose = container.querySelector("#btnClose");
  if (btnClose) {
    btnClose.addEventListener("click", () => closePage(container));
  }

  // Delegation for settings buttons and powerup selects
  container.addEventListener("click", (event) => {
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

  container.addEventListener("change", (event) => {
    const target = event.target as HTMLSelectElement;
    const action = target.getAttribute("data-action");
    if (action === "updatePowerupWeight") {
      const index = parseInt(target.getAttribute("data-index") || "-1", 10);
      if (index >= 0 && index < PowerUps.length) {
        PowerUps[index].weight = parseFloat(target.value);
      }
    }
  });
}

export function updatePowerupsMenu(): void {
  const sel = 'selected="selected"';
  let content = "";

  for (let i = 0; i < PowerUps.length; i++) {
    const name = PowerUps[i].name;
    const weight = PowerUps[i].weight;
    content += "<div class='option'>";
    content += "<span class='label powerupLabel'>" + name + "</span>";
    content += '<select data-action="updatePowerupWeight" data-index="' + i + '">';
    content += '<option value="0" ' + (weight === 0 ? sel : "") + ">0%</option>";
    content += '<option value="0.5" ' + (weight === 0.5 ? sel : "") + ">50%</option>";
    content += '<option value="1" ' + (weight === 1 ? sel : "") + ">100%</option>";
    content += '<option value="2" ' + (weight === 2 ? sel : "") + ">200%</option>";
    content += '<option value="10" ' + (weight === 10 ? sel : "") + ">1000%</option>";
    content += "</select></div>&nbsp;";
  }

  const optionsElem = document.getElementById("powerupsOptions");
  if (optionsElem) {
    optionsElem.innerHTML = content;
  }
}
