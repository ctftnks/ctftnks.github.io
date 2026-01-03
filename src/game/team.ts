// list of colors for the teams
const TEAMCOLORS = [
  "#DA1918", // red
  "#31B32B", // green
  "#1F87FF", // blue
  "#21B19B", // teal
  "#A020F0", // purple
  "#F4641D", // orange
  "#713B17", // brown
  "#E7E52C", // yellow
];

/**
 * Represents a team of players in the game.
 */
export default class Team {
  id: number;
  color: string;

  /**
   * Creates a new Team.
   * @param id - The team ID.
   * @param color - Optional color override.
   */
  constructor(id: number, color?: string) {
    this.id = id;
    this.color = color ?? TEAMCOLORS[this.id];
  }
}

// list of available teams
export const TEAMS = Array.from({ length: 8 }, (_, i) => new Team(i));
