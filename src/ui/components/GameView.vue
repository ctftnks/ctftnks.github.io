<template>
  <div class="canvas-container">
    <canvas ref="canvasRef" class="game-canvas"></canvas>
    <canvas ref="effectsRef" class="effects-canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Canvas from "@/game/canvas";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const effectsRef = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  if (canvasRef.value && effectsRef.value) {
    // Initialize Canvas with the elements directly
    store.canvas = new Canvas(canvasRef.value, effectsRef.value);

    // Setup initial players if empty
    store.initDefaultPlayers();

    // Start Game
    store.startNewGame();
    // Auto-pause on start so user can see menu
    if (store.game) {
      store.game.paused = true;
    }
  }

  window.addEventListener("resize", handleResize);
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  if (store.game) {
    store.game.stop();
    store.game = undefined;
  }
  store.canvas = undefined;
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeydown);
});

function handleResize() {
  if (store.game) {
    store.game.resize();
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && store.game && !store.game.paused) {
    store.game.pause();
    openPage("menu");
  }
}
</script>

<style scoped>
.canvas-container {
  position: fixed;
  top: 5%;
  left: 18%;
  width: 74%;
  height: 90%;
  z-index: 0;
}

.game-canvas,
.effects-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.game-canvas {
  z-index: 1;
}

.effects-canvas {
  z-index: 2;
  pointer-events: none; /* Let clicks pass through */
}
</style>
