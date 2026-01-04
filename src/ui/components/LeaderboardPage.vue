<template>
  <div class="popupshade" id="leaderboardshade" @click="forceNewGame"></div>
  <div class="popup">
    <h2>Leaderboard:&nbsp;&nbsp;Game #{{ store.GameID }}</h2>
    <span id="leaderboardCounter">{{ timeLeft }}s</span>

    <div id="leaderboard">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Score</th>
            <th>Kills</th>
            <th>Deaths</th>
            <th>Shots</th>
            <th>Miles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in sortedPlayers" :key="p.id">
            <td>{{ p.name }}</td>
            <td>{{ p.score }}</td>
            <td>{{ p.stats.kills }}</td>
            <td>{{ p.stats.deaths }}</td>
            <td>{{ p.stats.shots }}</td>
            <td>{{ Math.round(p.stats.miles / 100) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { store } from "@/game/store";
import { Settings } from "@/game/settings";
import { newGame } from "@/game/game";
import { openPage } from "@/stores/ui";

const timeLeft = ref(Settings.EndScreenTime);
let timerInt: number | undefined;
let timeoutInt: number | undefined;

const sortedPlayers = computed(() => {
  return [...store.players].sort((a, b) => b.score - a.score);
});

function forceNewGame() {
  newGame();
  openPage("game");
  window.dispatchEvent(new Event("resize"));
}

onMounted(() => {
  timerInt = window.setInterval(() => {
    timeLeft.value--;
  }, 1000);

  timeoutInt = window.setTimeout(() => {
    forceNewGame();
  }, Settings.EndScreenTime * 1000);
});

onUnmounted(() => {
  if (timerInt) clearInterval(timerInt);
  if (timeoutInt) clearTimeout(timeoutInt);
});
</script>

<style scoped>
#leaderboard table {
  position: relative;
  width: 80%;
  left: 10%;
  border-collapse: collapse;
}

#leaderboard th {
  padding: 8px;
  border-bottom: 1px solid #666;
}

#leaderboard td {
  padding: 8px;
}

#leaderboardCounter {
  position: absolute;
  top: 24px;
  right: 24px;
}
</style>
