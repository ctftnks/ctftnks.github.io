<template>
  <div id="sideBar">
    <div class="entry clickable" @click="openMenu">Menu</div>
    <div class="entry">&nbsp;</div>
    <div class="entry"><b>Scores</b></div>
    <div id="scoreBoard">
      <div v-for="p in sortedPlayers" :key="p.id" class="entry">
        <span class="name" :style="{ color: p.team.color }">{{ p.name }}</span>
        <span class="score">
          <span v-if="p.spree > 1" class="spree">{{ ">+" + p.spree }}</span>
          {{ p.score }}
        </span>
      </div>
    </div>
    <div class="entry">&nbsp;</div>
    <div class="entry clickable" @click="resetTime">
      Time:&nbsp;&nbsp;<span id="GameTimer">{{ timerDisplay }}</span
      >&nbsp;&nbsp;<span style="font-size: 0.8em; color: #555">click for more</span>
    </div>
    <div class="entry clickable" @click="nextMap">Next Map</div>
    <br />
    <div v-show="botSpeed" id="BotSpeedometer" class="entry">BotSpeed:&nbsp;&nbsp;{{ Math.round((botSpeed || 0) * 100) }} %</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import { openPage } from "@/stores/ui";

const timerDisplay = ref("00:00");
let timer: number | undefined;

const sortedPlayers = computed(() => {
  return [...store.players].sort((a, b) => b.score - a.score);
});

function updateTimer(t: number): void {
  const delta = Math.max(0, Settings.RoundTime * 60 - t / 1000);
  const minutes = Math.floor(delta / 60);
  const seconds = Math.floor(delta - minutes * 60);
  timerDisplay.value = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const botSpeed = computed(() => Settings.BotSpeed);

function openMenu(): void {
  openPage("menu");
}

function resetTime(): void {
  if (store.game) {
    store.game.resetTime();
  }
}

function nextMap(): void {
  store.startNewGame();
}

onMounted(() => {
  timer = window.setInterval(() => {
    updateTimer(store.game?.t ?? 0);
  }, 200);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped>
#sideBar {
  position: fixed;
  top: 5%;
  height: 90%;
  left: 0;
  width: 18%;
  font-weight: bold;
  color: #ffffff;
}

#sideBar .entry {
  position: relative;
  width: calc(100% - 6px);
  border-bottom: solid 1px #666;
  padding: 8px;
  margin-left: 6px;
  padding-right: 0px;
  padding-left: 0px;
}

#scoreBoard .entry .name {
  position: relative;
  left: 6px;
  width: 1.5em;
}

#scoreBoard .entry .score {
  position: absolute;
  right: 32px;
  /* width: 1em; */
  text-align: center;
}

#scoreBoard .entry .score .spree {
  font-size: 0.6em;
  color: #ff0000;
  margin-right: 10px;
}
</style>
