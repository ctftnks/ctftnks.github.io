<template>
  <div class="popupshade" id="quickstartShade" @click="close"></div>
  <div class="popup" id="quickstartMenu">
    <h2>Quick Games:</h2>

    <button class="option vspace" @click="quickPvP(2, 2)">2P vs 2P</button><br />
    <button class="option vspace" @click="quickPvP(2, 3)">3P vs 3P</button><br />
    <button class="option vspace" @click="quickPvP(3, 2)">2P vs 2P vs 2P</button><br />
    <br />
    <button class="option vspace" @click="quickPvB(2, 2)">2P vs 2C</button><br />
    <button class="option vspace" @click="quickPvB(2, 3)">3P vs 3C</button><br />
    <br />
    <button class="option vspace" @click="quickMixed(2, 2)">2M vs 2M</button><br />
    <button class="option vspace" @click="quickMixed(3, 2)">2M vs 2M vs 2M</button><br />
    <button class="option vspace" @click="quickUnevenMixed(2, 2)">2M vs 2B</button>
  </div>
</template>

<script setup lang="ts">
import { store } from "@/stores/game";
import { openPage } from "@/stores/ui";

function close() {
  openPage("menu");
}

function quickPvP(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      store.players.push(store.createPlayer(false));
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  close();
}

function quickPvB(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (i < nteams / 2) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  close();
}

function quickMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  close();
}

function quickUnevenMixed(nteams: number, teamsize: number): void {
  store.players = [];
  store.nplayers = 0;

  for (let i = 0; i < nteams; i++) {
    for (let j = 0; j < teamsize; j++) {
      if (j < teamsize / 2 && i === 0) {
        store.players.push(store.createPlayer(false));
      } else {
        store.players.push(store.createPlayer(true));
      }
      const p = store.players[store.players.length - 1];
      if (j > 0) {
        p.team = store.players[store.players.length - 2].team;
      }
    }
  }
  close();
}
</script>

<style scoped>
/* No specific styles found for quickstart, likely uses global or menu styles */
</style>
