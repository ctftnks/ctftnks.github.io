import { databinding } from "@/ui/databinding";
import { BasePage } from "@/ui/components/BasePage";

// Pre-register all page Web Components
import "./pages/index.ts";

/**
 * Open a page by name
 * Creates and mounts a Web Component for the specified page
 * Page names are converted to kebab-case custom element tags (e.g., "menu" → "menu-page")
 * @param name - The name of the page (e.g., "menu", "settings")
 * @returns The mounted page element
 */
export function openPage(name: string): BasePage {
  const tag = `${name}-page`;

  const container = document.getElementById("pageContainer");
  if (!container) {
    throw new Error("pageContainer element not found in DOM");
  }
  const wrapper = document.createElement("div");
  wrapper.className = "page";

  const page = document.createElement(tag) as BasePage;
  wrapper.appendChild(page);
  container.appendChild(wrapper);

  // Run databinding after page is mounted
  databinding();

  return page;
}

/**
 * Close a page
 * Accepts either a page element or any element within a page
 * @param pageOrElement - A page element, or any element contained within a page
 */
export function closePage(pageOrElement: BasePage | HTMLElement): void {
  if (!pageOrElement) {
    return;
  }

  // If it's a Web Component page, just remove it and walk up to the wrapper
  let elementToRemove: HTMLElement | null = null;

  if (pageOrElement instanceof BasePage) {
    // It's a Web Component, find its wrapper
    elementToRemove = pageOrElement.parentElement;
  } else {
    // It's a regular element, find the page wrapper
    elementToRemove = findPageWrapper(pageOrElement as HTMLElement);
  }

  if (elementToRemove?.parentElement) {
    elementToRemove.remove();
  }
}

/**
 * Find the page wrapper element containing a given element
 * Walks up the DOM tree to find the closest element with the "page" class
 * @param element
 */
function findPageWrapper(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element;
  let depth = 0;
  const maxDepth = 100;

  while (current && depth < maxDepth) {
    if (current.classList.contains("page")) {
      return current;
    }
    current = current.parentElement;
    depth++;
  }

  return null;
}
