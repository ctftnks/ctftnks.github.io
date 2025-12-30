import template from "./main.html?raw";
import "./style.css";

export function init(container) {
  container.innerHTML = template;
}
