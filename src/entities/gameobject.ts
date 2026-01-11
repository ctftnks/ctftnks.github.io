import type Game from "@/game/game";
import Coord from "./coord";
import Updatable from "./updatable";
import type Tile from "@/game/tile";

/**
 * Parent class for all objects in the game.
 * Base class for Tanks, Bullets, PowerUps, etc.
 */
export default abstract class GameObject extends Updatable implements Coord {
  x: number = 0;
  y: number = 0;
  width: number = 0;
  tile?: Tile;

  /**
   * Creates a new GameObject.
   * @param game - The game instance.
   */
  constructor(public game: Game) {
    super();
  }

  /**
   * Update the position of the object on the map
   * @param coord a coordinate tuple (x, y)
   */
  setPosition(coord: Coord): void {
    this.x = coord.x;
    this.y = coord.y;
  }

  /**
   * Default draw function.
   * @param context - The 2D rendering context.
   */
  abstract draw(context: CanvasRenderingContext2D): void;
}
