import Player from "./player";
import Autopilot from "./autopilot";
import type Tank from "@/entities/tank";
import type Team from "./team";

/**
 * A bot player that controls a tank automatically.
 * @augments Player
 */
export default class Bot extends Player {
  // keys are inherited from Player
  private autopilot: Autopilot;

  /**
   * Creates a new Bot.
   * @param id - The player ID.
   * @param name - The bot name.
   * @param team - The team of the bot.
   */
  constructor(id: number, name: string, team: Team) {
    super(id, name, team, []);
    this.autopilot = new Autopilot();
  }

  /**
   * Is the player a bot or a user?
   */
  isBot(): boolean {
    return true;
  }

  /**
   * Updates the bot's state.
   * @param tank - the tank to be steered by the player
   * @param dt - the time elapsed since the last frame in milliseconds
   */
  steer(tank: Tank, dt: number): void {
    if (!this.game) {
      return;
    }
    this.autopilot.step(tank, this.game, dt);
  }
}
