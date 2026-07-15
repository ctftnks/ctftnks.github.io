<template>
  <div id="powerupsShade" class="popupshade" @click="close"></div>
  <div id="powerupsMenu" class="popup">
    <h2>Powerups:</h2>

    <div id="powerupsOptions">
      <div v-for="(p, i) in PowerUps" :key="i" class="option">
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
      <NumberSelector v-model="Settings.PowerUpRate" :min="1" :max="60" suffix="s" @change="save" />
    </div>

    <div class="option vspace">
      <span>Amount</span>
      <NumberSelector v-model="Settings.MaxPowerUps" :min="0" :step="2" @change="save" />
    </div>

    <button id="btnClose" class="option vspace" @click="close">
      <ArrowLeft :size="16" />
      Back
    </button>
  </div>
</template>

<script setup lang="ts">
import { Settings } from "@/stores/settings";
import { PowerUps } from "@/entities/powerups";
import { store } from "@/stores/gamestore";
import { openPage } from "@/stores/ui";
import { ArrowLeft } from "@lucide/vue";
import NumberSelector from "./NumberSelector.vue";

function close(): void {
  openPage("menu");
}

function save(): void {
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
