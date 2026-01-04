import { ref } from "vue";

/**
 * Global UI state.
 */
export const page = ref("menu");

/**
 * Changes the active UI page.
 * @param p - Page name.
 */
export function openPage(p: string): void {
  page.value = p;
}
