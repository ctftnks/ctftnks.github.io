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

  constructor(id: number, color?: string) {
    this.id = id;
    if (color) {
      this.color = color;
    } else {
      this.color = TEAMCOLORS[this.id];
    }
  }
}

// list of available teams
export const TEAMS = [new Team(0), new Team(1), new Team(2), new Team(3), new Team(4), new Team(5), new Team(6), new Team(7)];
