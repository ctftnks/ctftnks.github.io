<template>
  <div class="popupshade" id="powerupsShade" @click="close"></div>
  <div class="popup" id="powerupsMenu">
    <h2>Powerups:</h2>

    <div id="powerupsOptions">
      <div class="option" v-for="(p, i) in PowerUps" :key="i">
        <span class="label powerupLabel">{{ p.name }}</span>
        <select v-model.number="p.weight">
          <option :value="0">0%</option>
          <option :value="0.5">50%</option>
          <option :value="1">100%</option>
          <option :value="2">200%</option>
          <option :value="10">1000%</option>
        </select>
      </div>
    </div>

    <br /><br />

    <div class="option vspace">
      <span>Rate</span>
      <button class="left" @click="updateSetting('PowerUpRate', -1, 1, 60)">-</button>
      <input class="left right" :value="Settings.PowerUpRate + 's'" size="1" readonly />
      <button class="right" @click="updateSetting('PowerUpRate', 1, 1, 60)">+</button>
    </div>

    <div class="option vspace">
      <span>Amount</span>
      <button class="left" @click="updateSetting('MaxPowerUps', -2, 0)">-</button>
      <input class="left right" :value="Settings.MaxPowerUps" size="1" readonly />
      <button class="right" @click="updateSetting('MaxPowerUps', 2)">+</button>
    </div>

    <button class="option vspace" id="btnClose" @click="close">Close</button>
  </div>
</template>

<script setup lang="ts">
import { Settings } from "@/game/settings";
import { PowerUps } from "@/entities/powerup";
import { store } from "@/game/store";
import { openPage } from "@/stores/ui";

function close() {
  openPage("menu");
}

function updateSetting(key: keyof typeof Settings, delta: number, min: number = 0, max?: number) {
  let val = Settings[key] as number;
  val += delta;
  if (val < min) val = min;
  if (max !== undefined && val > max) val = max;
  (Settings as any)[key] = val;
  store.saveSettings();
}
</script>

<style scoped>
#powerupsOptions {
  margin-top: 20px;
  margin-bottom: 20px;
}

#powerupsOptions .powerupLabel {
  width: 120px;
  display: inline-block;
}

#weaponMenu {
  position: fixed;
  top: 8%;
  left: 30%;
  min-height: 20%;
  width: 40%;
  border: solid 1px #bbb;
  background-color: #fff;
  box-shadow: 0px 0px 13px 0px rgba(94, 94, 94, 1);
  text-align: center;
}
</style>
