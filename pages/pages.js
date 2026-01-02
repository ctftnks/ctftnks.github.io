// create page div in container, load content into page
import { databinding } from "../src/databinding.js";

let pageID = 0;

// Discover all page modules
const pageModules = import.meta.glob("./**/main.js");

export async function openPage(name) {
  const id = pageID++;
  const container = document.createElement("div");
  container.className = "page";
  container.id = "page" + id;
  document.getElementById("pageContainer").appendChild(container);

  const modulePath = `./${name}/main.js`;
  if (pageModules[modulePath]) {
    try {
      const module = await pageModules[modulePath]();
      if (module.init) {
        module.init(container);
      }
      databinding();
    } catch (e) {
      console.error(`Failed to load page module: ${name}`, e);
    }
  } else {
    console.error(`Page module not found: ${name}`);
  }

  return id;
}

// close a page by ID or child
export function closePage(id) {
  if (typeof id === "number") {
    const elem = document.getElementById("page" + id);
    if (elem != null && typeof elem !== "undefined") elem.parentNode.removeChild(elem);
  }
  if (typeof id === "object") {
    let count = 0;
    while (id && (!id.matches || !id.matches(".page")) && count < 100) {
      id = id.parentNode;
      count++;
    }
    if (id && id.parentNode) {
      id.parentNode.removeChild(id);
    }
  }
}

window.openPage = openPage;
window.closePage = closePage;
