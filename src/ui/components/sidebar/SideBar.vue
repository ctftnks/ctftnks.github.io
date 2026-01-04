<template>
  <div id="sideBar">
    <div class="entry clickable" @click="openMenu">Menu</div>
    <div class="entry">&nbsp;</div>
    <div class="entry"><b>Scores</b></div>
    <div id="scoreBoard">
      <div class="entry" v-for="p in sortedPlayers" :key="p.id">
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
    <div class="entry" v-show="botSpeed" id="BotSpeedometer">BotSpeed:&nbsp;&nbsp;{{ Math.round((botSpeed || 0) * 100) }} %</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { store } from "@/game/store";
import { gameEvents, EVENTS } from "@/game/events";
import { openPage } from "@/stores/ui";
import { newGame } from "@/game/game";

const timerDisplay = ref("00:00");
const botSpeed = ref<number | undefined>(undefined);

const sortedPlayers = computed(() => {
  return [...store.players].sort((a, b) => b.score - a.score);
});

function onTimeUpdated(secs?: number) {
  if (typeof secs === "undefined") return;
  const minutes = Math.floor(secs / 60);
  const seconds = Math.floor(secs - minutes * 60);
  timerDisplay.value = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function onBotSpeedUpdated(speed?: number) {
  botSpeed.value = speed;
}

function openMenu() {
  openPage("menu");
}

function resetTime() {
  if (store.game) {
    store.game.resetTime();
  }
}

function nextMap() {
  newGame();
}

onMounted(() => {
  gameEvents.on(EVENTS.TIME_UPDATED, onTimeUpdated);
  gameEvents.on(EVENTS.BOT_SPEED_UPDATED, onBotSpeedUpdated);
});

onUnmounted(() => {
  gameEvents.off(EVENTS.TIME_UPDATED, onTimeUpdated);
  gameEvents.off(EVENTS.BOT_SPEED_UPDATED, onBotSpeedUpdated);
});
</script>

<style scoped>
@import "./style.css";
</style>
