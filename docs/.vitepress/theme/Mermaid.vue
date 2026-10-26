<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useData } from "vitepress";

const props = defineProps<{
  /** URI-encoded mermaid diagram source */
  code: string;
}>();

const { isDark } = useData();
const svg = ref("");
let counter = 0;

/** Renders the diagram for the current color scheme. */
async function render(): Promise<void> {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false, theme: isDark.value ? "dark" : "default" });
  try {
    const result = await mermaid.render(`mermaid-${Date.now()}-${counter++}`, decodeURIComponent(props.code));
    svg.value = result.svg;
  } catch (error) {
    console.error("Mermaid rendering failed", error);
    svg.value = "";
  }
}

onMounted(render);
watch(isDark, render);
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- SVG is sanitized by mermaid (securityLevel "strict") -->
  <div class="mermaid" v-html="svg"></div>
</template>
