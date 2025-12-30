import template from "./main.html?raw";
import "./style.css";

const maplist = ["Avocado", "Prims-Maze", "Rust", "Spirals"];
window.maplist = maplist;

export function init(container) {
  container.innerHTML = template;

  const listElem = document.getElementById("importMapList");
  for (let i = 0; i < maplist.length; i++) {
    const name = maplist[i];
    let entry = "";
    entry += "<button class='option vspace' onclick=\"MapGenerator.importMap('" + name + "');closePage(this);\">" + name + "</button>";
    listElem.innerHTML += entry;
  }
}
