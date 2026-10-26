import { beforeEach } from "vitest";
import { Settings, DEFAULT_SETTINGS } from "@/stores/settings";

// Settings are a global singleton, so every test starts from the defaults instead of whatever a previous test left behind.
beforeEach(() => {
  Object.assign(Settings, DEFAULT_SETTINGS);
});
