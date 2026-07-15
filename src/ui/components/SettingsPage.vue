<template>
  <div id="settingsShade" class="popupshade" @click="closeSettings"></div>
  <div id="settingsMenu" class="popup">
    <h2>Settings</h2>

    <div id="settingsTable">
      <div class="leftCol">
        <div class="option">
          <span>Tank speed</span>
          <NumberSelector v-model="Settings.TankSpeed" :min="0" :step="20" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Bullet speed</span>
          <NumberSelector v-model="Settings.BulletSpeed" :min="0" :step="20" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Bullet timeout</span>
          <NumberSelector v-model="Settings.BulletTimeout" :min="1" :step="1" suffix="s" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Respawn time</span>
          <NumberSelector v-model="Settings.RespawnTime" :min="0" :step="0.5" suffix="s" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Spawn shield</span>
          <NumberSelector v-model="Settings.SpawnShieldTime" :min="0" :step="0.5" suffix="s" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Map min-size</span>
          <NumberSelector v-model="Settings.MapNxMin" :min="2" :step="1" @change="save" />
        </div>
        <br />
        <div class="option">
          <span>Map max-size</span>
          <NumberSelector v-model="Settings.MapNxMax" :min="2" :step="1" @change="save" />
        </div>
        <br />
        <div class="option">
          <span class="left">Show tank labels</span>
          <select v-model="Settings.ShowTankLabels" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Performance Stats</span>
          <select v-model="Settings.PerformanceStats" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
      </div>
      <div class="rightCol">
        <div class="option">
          <span>Round time</span>
          <NumberSelector v-model="Settings.RoundTime" :min="1" :step="0.5" suffix=" min" @change="save" />
        </div>
        <br />
        <div class="option">
          <span class="left">Reset score each round</span>
          <select v-model="Settings.ResetStatsEachGame" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Adaptive bot speed</span>
          <select v-model="Settings.AdaptiveBotSpeed" class="right" @change="save">
            <option :value="false">off</option>
            <option :value="true">on</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Bots shoot bots</span>
          <select v-model="Settings.BotsShootBots" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Bullet Collisions</span>
          <select v-model="Settings.BulletsCanCollide" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Friendly Fire</span>
          <select v-model="Settings.FriendlyFire" class="right" @change="save">
            <option :value="true">on</option>
            <option :value="false">off</option>
          </select>
        </div>
        <br />
        <div class="option">
          <span class="left">Sound</span>
          <select v-model="Settings.muted" class="right" @change="save">
            <option :value="false">on</option>
            <option :value="true">off</option>
          </select>
        </div>
        <br />
      </div>
    </div>
    <div style="text-align: center; clear: both; padding-top: 20px; display: flex; justify-content: center; gap: 10px">
      <button id="btnResetSettings" class="option" @click="resetToDefaults">
        <RotateCcw :size="16" />
        Reset to Defaults
      </button>
      <button id="btnCloseSettings" class="option" @click="closeSettings">
        <ArrowLeft :size="16" />
        Back
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, DEFAULT_SETTINGS } from "@/stores/settings";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { RotateCcw, ArrowLeft } from "@lucide/vue";
import NumberSelector from "./NumberSelector.vue";

function closeSettings(): void {
  openPage("menu");
}

function save(): void {
  store.saveSettings();
}

function resetToDefaults(): void {
  Object.assign(Settings, DEFAULT_SETTINGS);
  save();
}
</script>

<style scoped>
#settingsTable {
  width: 80%;
  position: relative;
  left: 10%;
}

#settingsTable .leftCol {
  float: left;
  width: 50%;
  position: relative;
  left: 0;
  top: 0;
}

#settingsTable .rightCol {
  float: left;
  width: 50%;
  position: relative;
  left: 0;
  top: 0;
}
</style>
