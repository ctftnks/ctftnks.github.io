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
  protected render(): void {
    // Override in subclass
  }

  /**
   * Attach event listeners
   * Override in subclass
   */
  protected attachListeners(): void {
    // Override in subclass
  }

  /**
   * Called after component is mounted to DOM
   * Override in subclass
   */
  protected onMount(): void {
    // Override in subclass
  }

  /**
   * Called before component is removed from DOM
   * Override in subclass
   */
  protected onUnmount(): void {
    // Override in subclass
  }

  /**
   * Close this page component
   */
  closePage(): void {
    this.remove();
  }
}
