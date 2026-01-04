/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

/**
 * Allow import of HTML files
 */
declare module "*.html?raw" {
  const content: string;
  export default content;
}
