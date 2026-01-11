<template>
  <div class="canvas-container">
    <canvas ref="canvasRef" class="game-canvas"></canvas>
    <canvas ref="effectsRef" class="effects-canvas"></canvas>
    <div v-if="stats && Settings.PerformanceStats" class="perf-stats">
      <div>
        FPS: <span :class="getFpsColor(stats.fps)">{{ stats.fps.toFixed(0) }}</span>
      </div>
      <div>Logic: {{ stats.logicTime.toFixed(2) }}ms</div>
      <div>Render: {{ stats.renderTime.toFixed(2) }}ms</div>
      <div v-if="Object.keys(stats.custom).length > 0" class="custom-stats">
        <div v-for="(val, key) in stats.custom" :key="key">{{ formatKey(key) }}: {{ val.toFixed(2) }}ms</div>
      </div>
      <div v-if="Object.keys(stats.extraInfo).length > 0" class="custom-stats">
        <div v-for="(val, key) in stats.extraInfo" :key="key">{{ formatKey(key) }}: {{ val }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import Canvas from "@/game/canvas";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { PerformanceMonitor, type PerformanceStats } from "@/game/performanceMonitor";
import { Settings } from "@/stores/settings";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const effectsRef = ref<HTMLCanvasElement | null>(null);
const stats = ref<PerformanceStats | null>(null);
let statsInterval: number | undefined;

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

  // Poll performance stats
  statsInterval = setInterval(() => {
    stats.value = PerformanceMonitor.getInstance().getStats();
  }, 500);
});

onUnmounted(() => {
  if (store.game) {
    store.game.stop();
    store.game = undefined;
  }
  store.canvas = undefined;
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  window.removeEventListener("resize", handleResize);
  window.removeEventListener("keydown", handleKeydown);
});

function handleResize(): void {
  if (store.game) {
    store.game.resize();
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === "Escape" && store.game && !store.game.paused) {
    store.game.pause();
    openPage("menu");
  }
}

function getFpsColor(fps: number): string {
  if (fps >= 50) {
    return "text-green";
  }
  if (fps >= 30) {
    return "text-yellow";
  }
  return "text-red";
}

function formatKey(key: string): string {
  return key.replace("step_", "");
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

.perf-stats {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 8px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  z-index: 100;
  pointer-events: none;
}

.custom-stats {
  margin-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  padding-top: 4px;
  color: #ccc;
}

.text-green {
  color: #4caf50;
}
.text-yellow {
  color: #ffeb3b;
}
.text-red {
  color: #f44336;
}
</style>
