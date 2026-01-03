import { PowerUps } from "@/objects/powerup";
import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
  updatePowerupsMenu();
}

export function updatePowerupsMenu(): void {
  const sel = 'selected="selected"';
  let content = "";

  for (let i = 0; i < PowerUps.length; i++) {
    const name = PowerUps[i].name;
    const weight = PowerUps[i].weight;
    content += "<div class='option'>";
    content += "<span class='label powerupLabel'>" + name + "</span>";
    content += '<select onchange="PowerUps[' + i + '].weight=parseFloat(this.value)">';
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

(window as any).PowerUps = PowerUps;
