<template>
  <SideBar />
  <component :is="currentPageComponent" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import SideBar from "@/ui/components/sidebar/SideBar.vue";
import MenuPage from "@/ui/components/menu/MenuPage.vue";
import SettingsPage from "@/ui/components/settings/SettingsPage.vue";
import PowerupsPage from "@/ui/components/powerups/PowerupsPage.vue";
import LeaderboardPage from "@/ui/components/leaderboard/LeaderboardPage.vue";
import QuickstartPage from "@/ui/components/quickstart/QuickstartPage.vue";
import { currentPage } from "@/stores/ui";

const currentPageComponent = computed(() => {
  switch (currentPage.value) {
    case "menu":
      return MenuPage;
    case "settings":
      return SettingsPage;
    case "powerups":
      return PowerupsPage;
    case "leaderboard":
      return LeaderboardPage;
    case "quickstart":
      return QuickstartPage;
    case "game":
      return null;
    default:
      return MenuPage;
  }
});
</script>
