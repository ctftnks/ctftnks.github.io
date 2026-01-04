<template>
  <div id="menuShade" class="popupshade" @click="closeMenu"></div>
  <div class="popup">
    <h1>CTF Tanks</h1>

    <div class="option">
      <span class="left">Mode</span>
      <select v-model="Settings.GameMode" class="right">
        <option value="CTF">CTF</option>
        <option value="DM">DM</option>
        <option value="TDM">TDM</option>
        <option value="KOTH">KOTH</option>
      </select>
    </div>
    <div class="option">
      <span class="left">Bots</span>
      <select v-model.number="Settings.BotSpeed" class="right">
        <option value="0.6">Lame</option>
        <option value="0.8">Ok</option>
        <option value="1">Decent</option>
        <option value="1.2">Quick</option>
        <option value="1.4">Pro</option>
        <option value="1.8">Insane</option>
      </select>
    </div>
    <button id="btnMute" class="option" style="width: 90px" @click="toggleMute">Sound: {{ Settings.muted ? "off" : "on" }}</button>
    <button id="btnPowerups" class="option" @click="openPage('powerups')">PowerUps</button>
    <button id="btnSettings" class="option" @click="openPage('settings')">Settings</button>

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
      <div v-for="(player, index) in store.players" :key="player.id" class="entry">
        <button class="team" :style="{ color: player.team.color }" @click="changeTeam(index)">&diams;</button>
        <button class="name" :style="{ color: player.team.color }" @click="editName(index)">{{ player.name }}</button>

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

    <button id="btnAddPlayer" class="option vspace" @click="addPlayer(false)">Add Player</button>
    <button id="btnAddBot" class="option vspace" @click="addPlayer(true)">Add Bot</button>
    <button id="btnQuickTeams" class="option vspace" @click="openPage('quickstart')">Quick Teams</button>
    <button id="btnStartGame" class="option vspace" @click="startGame">Start Game!</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, toRaw } from "vue";
import { store } from "@/stores/gamestore";
import { Settings } from "@/stores/settings";
import { openPage } from "@/stores/ui";
import { TEAMS } from "@/game/team";

const editingMapID = ref<number | null>(null);
const editingKeyID = ref<number | null>(null);

function closeMenu(): void {
  if (!store.game) {
    store.startNewGame();
  } else {
    store.game.paused = false;
  }
  openPage("game");
  window.dispatchEvent(new Event("resize"));
}

function startGame(): void {
  store.startNewGame();
  openPage("game");
  window.dispatchEvent(new Event("resize"));
}

function toggleMute(): void {
  Settings.muted = !Settings.muted;
  store.saveSettings();
}

function addPlayer(bot: boolean): void {
  if (store.players.length >= store.keymaps.length) {
    store.keymaps.push(store.keymaps[0].slice());
  }
  store.players.push(store.createPlayer(bot));
}

function removePlayer(id: number): void {
  store.players = store.players.filter((p) => p.id !== id);
}

function changeTeam(index: number): void {
  const player = store.players[index];
  const currentIndex = TEAMS.indexOf(toRaw(player.team));
  player.team = TEAMS[(currentIndex + 1) % TEAMS.length];
}

function editName(index: number): void {
  const name = prompt("Namen eingeben:", store.players[index].name);
  if (name != null) {
    store.players[index].name = name;
  }
}

function getKeyLabel(code: string): string {
  if (!code) {
    return "";
  }
  const label = code
    .replace(/^Key/, "")
    .replace(/^Arrow/, "")
    .replace(/^Digit/, "")
    .replace(/^Numpad/, "Num");
  if (label === "Space") {
    return "Space";
  }
  return label.toUpperCase();
}

function isEditing(mapID: number, keyID: number): boolean {
  return editingMapID.value === mapID && editingKeyID.value === keyID;
}

function startEditKeymap(mapID: number, keyID: number): void {
  editingMapID.value = mapID;
  editingKeyID.value = keyID;
}

function doEditKeymap(newKeyCode: string): void {
  if (editingMapID.value === null || editingKeyID.value === null) {
    return;
  }
  store.keymaps[editingMapID.value][editingKeyID.value] = newKeyCode;
  editingMapID.value = null;
  editingKeyID.value = null;
}

const keydownHandler = (event: KeyboardEvent): void => {
  if (editingMapID.value !== null) {
    event.preventDefault();
    if (event.code.startsWith("Control")) {
      return;
    }
    doEditKeymap(event.code);
  }
};

onMounted(() => {
  if (store.game) {
    store.game.paused = true;
  }
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
