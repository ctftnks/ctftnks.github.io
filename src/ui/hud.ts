import { gameEvents, EVENTS } from "@/game/events";
import { updateScores } from "@/ui/ui";

/**
 * Initializes HUD event listeners to update UI elements when game state changes.
 * This decouples the game logic from direct DOM manipulation.
 */
export function initHUD(): void {
  gameEvents.on<number>(EVENTS.TIME_UPDATED, (timeRemaining: number) => {
    const timerElem = document.getElementById("GameTimer");
    if (timerElem) {
      const dtm = Math.floor(timeRemaining / 60);
      const dts = Math.floor(timeRemaining - dtm * 60);
      timerElem.innerHTML = `${String(dtm).padStart(2, "0")}:${String(dts).padStart(2, "0")}`;
    }
  });

  gameEvents.on<number>(EVENTS.BOT_SPEED_UPDATED, (speed: number) => {
    const bs = document.getElementById("BotSpeedometer");
    if (bs) {
      bs.style.display = "block";
      bs.innerHTML = "BotSpeed:&nbsp;&nbsp;" + Math.round(speed * 100) + " %";
    }
  });

  gameEvents.on(EVENTS.SCORE_UPDATED, () => {
    updateScores();
  });
}
