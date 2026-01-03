// create page div in container, load content into page
import { databinding } from "@/ui/databinding";

let pageID = 0;

// Discover all page modules
const pageModules = import.meta.glob("./pages/*/main.ts");

export async function openPage(name: string): Promise<number> {
  const id = pageID++;
  const container = document.createElement("div");
  container.className = "page";
  container.id = "page" + id;
  const pageContainerElem = document.getElementById("pageContainer");
  if (pageContainerElem) {
    pageContainerElem.appendChild(container);
  }

  const modulePath = `./pages/${name}/main.ts`;
  if (pageModules[modulePath]) {
    try {
      const module = (await pageModules[modulePath]()) as any;
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
export function closePage(id: number | HTMLElement | GlobalEventHandlers | ParentNode): void {
  if (typeof id === "number") {
    const elem = document.getElementById("page" + id);
    if (elem != null && typeof elem !== "undefined" && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }
  if (typeof id === "object") {
    let elem: HTMLElement = id as HTMLElement;
    let count = 0;
    while (elem && (!elem.matches || !elem.matches(".page")) && count < 100) {
      elem = elem.parentNode as HTMLElement;
      count++;
    }
    if (elem && elem.parentNode) {
      elem.parentNode.removeChild(elem);
    }
  }
}
