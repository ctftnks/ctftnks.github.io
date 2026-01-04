import { ref } from "vue";

export const currentPage = ref("menu");

export function openPage(name: string): void {
  currentPage.value = name;
}
