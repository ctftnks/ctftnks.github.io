import DefaultTheme from "vitepress/theme";
import type { Theme } from "vitepress";
import Mermaid from "./Mermaid.vue";

export default {
  extends: DefaultTheme,
  /**
   * Registers the Mermaid component used by markdown fences.
   * @param ctx - VitePress app context
   * @param ctx.app - The Vue app instance
   */
  enhanceApp({ app }) {
    app.component("Mermaid", Mermaid);
  },
} satisfies Theme;
