import template from "./main.html?raw";
import "./style.css";

export function init(container: HTMLElement): void {
  container.innerHTML = template;
}
