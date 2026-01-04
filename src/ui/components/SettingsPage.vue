<template>
  <div id="settingsShade" class="popupshade" @click="closeSettings"></div>
  <div id="settingsMenu" class="popup">
    <h2>Settings</h2>

    <div id="settingsTable">
      <div class="leftCol">
        <div class="option">
          <span>Tank speed</span>
          <button class="left" @click="updateSetting('TankSpeed', -20, 0)">-</button>
          <input class="left right" :value="Settings.TankSpeed" size="2" readonly />
          <button class="right" @click="updateSetting('TankSpeed', 20)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Bullet speed</span>
          <button class="left" @click="updateSetting('BulletSpeed', -20, 0)">-</button>
          <input class="left right" :value="Settings.BulletSpeed" size="2" readonly />
          <button class="right" @click="updateSetting('BulletSpeed', 20)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Bullet timeout</span>
          <button class="left" @click="updateSetting('BulletTimeout', -1, 1)">-</button>
          <input class="left right" :value="Settings.BulletTimeout + 's'" size="2" readonly />
          <button class="right" @click="updateSetting('BulletTimeout', 1)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Respawn time</span>
          <button class="left" @click="updateSetting('RespawnTime', -0.5, 0)">-</button>
          <input class="left right" :value="Settings.RespawnTime + 's'" size="2" readonly />
          <button class="right" @click="updateSetting('RespawnTime', 0.5)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Spawn shield</span>
          <button class="left" @click="updateSetting('SpawnShieldTime', -0.5, 0)">-</button>
          <input class="left right" :value="Settings.SpawnShieldTime + 's'" size="2" readonly />
          <button class="right" @click="updateSetting('SpawnShieldTime', 0.5)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Map min-size</span>
          <button class="left" @click="updateSetting('MapNxMin', -1, 2)">-</button>
          <input class="left right" :value="Settings.MapNxMin" size="2" readonly />
          <button class="right" @click="updateSetting('MapNxMin', 1)">+</button>
        </div>
        <br />
        <div class="option">
          <span>Map max-size</span>
          <button class="left" @click="updateSetting('MapNxMax', -1, 2)">-</button>
          <input class="left right" :value="Settings.MapNxMax" size="2" readonly />
          <button class="right" @click="updateSetting('MapNxMax', 1)">+</button>
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
      </div>
      <div class="rightCol">
        <div class="option">
          <div class="option">
            <span>Respawn time</span>
            <button class="left" @click="updateSetting('RespawnTime', -0.5, 0)">-</button>
            <input class="left right" :value="Settings.RespawnTime + ' s'" size="2" readonly />
            <button class="right" @click="updateSetting('RespawnTime', 0.5)">+</button>
          </div>
          <br />
          <span>Round time</span>
          <button class="left" @click="updateSetting('RoundTime', -0.5, 1)">-</button>
          <input class="left right" :value="Settings.RoundTime + ' min'" size="2" readonly />
          <button class="right" @click="updateSetting('RoundTime', 0.5)">+</button>
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
    <div style="text-align: center; clear: both; padding-top: 20px">
      <button id="btnResetSettings" class="option" @click="resetToDefaults">Reset to Defaults</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, DEFAULT_SETTINGS } from "@/stores/settings";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";

function closeSettings() {
  openPage("menu");
}

function save() {
  store.saveSettings();
}

function resetToDefaults() {
  Object.assign(Settings, DEFAULT_SETTINGS);
  save();
}

function updateSetting(key: keyof typeof Settings, delta: number, min: number = 0) {
  let val = Settings[key] as number;
  val += delta;
  if (val < min) {
    val = min;
  }
  (Settings as any)[key] = val;
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
