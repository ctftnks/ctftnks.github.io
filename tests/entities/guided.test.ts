import { describe, it, expect, beforeEach, vi } from "vitest";
import Game from "@/game/game";
import Player from "@/game/player";
import Tank from "@/entities/tank";
import { Guided, Gun } from "@/entities/weapons";
import { Settings } from "@/stores/settings";
import { TEAMS } from "@/game/team";

vi.mock("@/game/effects", () => ({
  playSound: vi.fn(),
  stopMusic: vi.fn(),
}));

describe("Guided missile and other bullets", () => {
  let game: Game;
  let tank: Tank;

  beforeEach(() => {
    const canvas = { width: 1000, height: 800, draw: vi.fn(), clearEffects: vi.fn(), rescale: vi.fn() } as any;
    Settings.MapNxMin = 6;
    Settings.MapNxMax = 6;
    game = new Game(canvas);
    const player = new Player(0, "P1", TEAMS[0], []);
    game.addPlayer(player);
    tank = new Tank(player, game);
    tank.setPosition({ x: 195, y: 195 });
    game.addObject(tank);
  });

  for (const bulletsCanCollide of [true, false]) {
    it(`can be shot down with Settings.BulletsCanCollide = ${bulletsCanCollide}`, () => {
      Settings.BulletsCanCollide = bulletsCanCollide;
      const missile = new Guided(tank).newBullet();
      const other = new Gun(tank).newBullet();
      other.setPosition(missile);
      other.lethal = true;
      missile.lethal = true;
      other.age = missile.age = 100;
      game.map.clearObjectLists();
      game.objs.forEach((o) => game.map.addObject(o));

      missile.step(10);

      expect(missile.isDeleted()).toBe(true);
      expect(other.isDeleted()).toBe(true);
    });
  }

  it("does not make ordinary bullets collide when the setting is disabled", () => {
    Settings.BulletsCanCollide = false;
    const a = new Gun(tank).newBullet();
    const b = new Gun(tank).newBullet();
    b.setPosition(a);
    a.lethal = b.lethal = true;
    a.age = b.age = 100;
    game.map.clearObjectLists();
    game.objs.forEach((o) => game.map.addObject(o));

    a.step(10);

    expect(a.isDeleted()).toBe(false);
    expect(b.isDeleted()).toBe(false);
  });
});
