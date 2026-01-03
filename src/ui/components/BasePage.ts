/**
 * Base class for all page Web Components
 * Provides common lifecycle hooks and utilities
 */
export class BasePage extends HTMLElement {
  protected isInitialized = false;

  connectedCallback(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.render();
      this.attachListeners();
      this.onMount();
    }
  }

  disconnectedCallback(): void {
    this.onUnmount();
  }

  /**
   * Render the component HTML
   * Override in subclass
   */
  protected render(): void {}

  /**
   * Attach event listeners
   * Override in subclass
   */
  protected attachListeners(): void {}

  /**
   * Called after component is mounted to DOM
   * Override in subclass
   */
  protected onMount(): void {}

  /**
   * Called before component is removed from DOM
   * Override in subclass
   */
  protected onUnmount(): void {}
}
