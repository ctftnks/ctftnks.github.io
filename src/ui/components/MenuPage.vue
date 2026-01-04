<template>
  <div class="popupshade" id="menuShade" @click="closeMenu"></div>
  <div class="popup">
    <h1>CTF Tanks</h1>

    <div class="option">
      <span class="left">Mode</span>
      <select class="right" v-model="Settings.GameMode">
        <option value="CTF">CTF</option>
        <option value="DM">DM</option>
        <option value="TDM">TDM</option>
        <option value="KOTH">KOTH</option>
      </select>
    </div>
    <div class="option">
      <span class="left">Bots</span>
      <select class="right" v-model.number="Settings.BotSpeed">
        <option value="0.6">Lame</option>
        <option value="0.8">Ok</option>
        <option value="1">Decent</option>
        <option value="1.2">Quick</option>
        <option value="1.4">Pro</option>
        <option value="1.8">Insane</option>
      </select>
    </div>
    <button class="option" id="btnMute" @click="toggleMute" style="width:90px">Sound: {{ Settings.muted ? "off" : "on" }}</button>
    <button class="option" id="btnPowerups" @click="openPage('powerups')">PowerUps</button>
    <button class="option" id="btnSettings" @click="openPage('settings')">Settings</button>

    <div id="playersMenu">
      <div class="entry">
        <span style="width: 50px; display: inline-block"></span>
        <button class="name notclickable">Name</button>
        <button class="keyEditButton notclickable">&uarr;</button>
        <button class="keyEditButton notclickable">&larr;</button>
        <button class="keyEditButton notclickable">&darr;</button>
        <button class="keyEditButton notclickable">&rarr;</button>
        <button class="keyEditButton notclickable">Fire</button>
        <span style="width: 50px; display: inline-block"></span>
      </div>
      <div class="entry" v-for="(player, index) in store.players" :key="player.id">
        <button class="team" @click="changeTeam(index)" :style="{ color: player.team.color }">&diams;</button>
        <button class="name" @click="editName(index)" :style="{ color: player.team.color }">{{ player.name }}</button>

        <template v-if="player.isBot()">
          <button v-for="i in 5" :key="i" class="keyEditButton notclickable">-</button>
        </template>
        <template v-else>
          <button
            v-for="(key, kIndex) in store.keymaps[player.id]"
            :key="kIndex"
            class="keyEditButton"
            :class="{ editing: isEditing(player.id, kIndex) }"
            @click="startEditKeymap(player.id, kIndex)"
          >
            {{ getKeyLabel(key) }}
          </button>
        </template>
        <button class="remove" @click="removePlayer(player.id)">&times;</button>
      </div>
    </div>

    <button class="option vspace" id="btnAddPlayer" @click="addPlayer(false)">Add Player</button>
    <button class="option vspace" id="btnAddBot" @click="addPlayer(true)">Add Bot</button>
    <button class="option vspace" id="btnQuickTeams" @click="openPage('quickstart')">Quick Teams</button>
    <button class="option vspace" id="btnStartGame" @click="startGame">Start Game!</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import { openPage } from "@/stores/ui";
import { TEAMS } from "@/game/team";

const editingMapID = ref<number | null>(null);
const editingKeyID = ref<number | null>(null);

function closeMenu() {
  if (!store.game) {
    store.startNewGame();
  } else {
    store.game.paused = false;
  }
  openPage("game");
  window.dispatchEvent(new Event("resize"));
}

function startGame() {
  store.startNewGame();
  openPage("game");
  window.dispatchEvent(new Event("resize"));
}

function toggleMute() {
  Settings.muted = !Settings.muted;
  store.saveSettings();
}

function addPlayer(bot: boolean) {
  if (store.players.length >= store.keymaps.length) {
    store.keymaps.push(store.keymaps[0].slice());
  }
  store.players.push(store.createPlayer(bot));
}

function removePlayer(id: number) {
  store.players = store.players.filter((p) => p.id !== id);
}

function changeTeam(index: number) {
  const player = store.players[index];
  const currentIndex = TEAMS.indexOf(player.team);
  player.team = TEAMS[(currentIndex + 1) % TEAMS.length];
}

function editName(index: number) {
  const name = prompt("Namen eingeben:", store.players[index].name);
  if (name != null) {
    store.players[index].name = name;
  }
}

function getKeyLabel(code: string): string {
  if (!code) return "";
  const label = code
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace(/^Digit/, "")
    .replace(/^Numpad/, "Num");
  if (label === "Space") return "Space";
  return label.toUpperCase();
}

function isEditing(mapID: number, keyID: number) {
  return editingMapID.value === mapID && editingKeyID.value === keyID;
}

function startEditKeymap(mapID: number, keyID: number) {
  editingMapID.value = mapID;
  editingKeyID.value = keyID;
}

function doEditKeymap(newKeyCode: string) {
  if (editingMapID.value === null || editingKeyID.value === null) return;
  store.keymaps[editingMapID.value][editingKeyID.value] = newKeyCode;
  editingMapID.value = null;
  editingKeyID.value = null;
}

const keydownHandler = (event: KeyboardEvent) => {
  if (editingMapID.value !== null) {
    event.preventDefault();
    if (event.code.startsWith("Control")) return;
    doEditKeymap(event.code);
  }
};

onMounted(() => {
  if (store.game) store.game.paused = true;
  window.addEventListener("keydown", keydownHandler);
});

onUnmounted(() => {
  window.removeEventListener("keydown", keydownHandler);
});
</script>

<style scoped>
#playersMenu {
  position: relative;
  width: 100%;
  left: 0px;
  margin-top: 20px;
  margin-bottom: 20px;
}

#playersMenu .name {
  display: inline-block;
  width: 120px;
  margin-right: 20px;
}

#playersMenu .team {
  display: inline-block;
  width: 36px;
  margin-right: 20px;
}

#playersMenu .remove {
  display: inline-block;
  width: 36px;
  margin-left: 20px;
  color: #f44336;
}

.keyEditButton {
  margin: 2px;
  width: 60px;
}

.keyEditButton.editing {
  opacity: 0.6;
}
</style>
