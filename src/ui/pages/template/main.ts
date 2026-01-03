import { BasePage } from "@/ui/components/BasePage";
import template from "./main.html?raw";
import "./style.css";
import { databinding } from "@/ui/databinding";
import { closePage } from "@/ui/pages";

export class TemplatePage extends BasePage {
  protected render(): void {
    this.innerHTML = template;
  }

  protected attachListeners(): void {
    const shade = this.querySelector("#templateShade");
    if (shade) {
      shade.addEventListener("click", () => {
        closePage(this);
      });
    }
  }

  protected onMount(): void {
    // Run databinding after mount to initialize data-bind attributes
    databinding();
  }
}

// Register the Web Component
customElements.define("template-page", TemplatePage);

// Export for backward compatibility with existing page loader
export function init(container: HTMLElement): void {
  const component = new TemplatePage();
  container.appendChild(component);
}
