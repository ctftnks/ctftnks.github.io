# Adding New Weapons

To add a new weapon to CTFTNKS, follow these steps:

1. **Create the Weapon Class**: Create a new file in `src/entities/weapons/`. Inherit from the base `Weapon` class.
2. **Define Behavior**: Override the `fire()` method to define how the weapon shoots.
3. **Register Weapon**: Add the new weapon to `src/entities/weapons/index.ts`.
4. **Add Assets**: Add a corresponding icon in `public/img/` and a sound in `public/sound/`. Update `src/game/assets.ts` to include them.

## Example

```typescript
export class MyNewWeapon extends Weapon {
  constructor(tank: Tank) {
    super(tank);
    this.name = "Super Blaster";
    this.cooldown = 500;
  }
  // implementation...
}
```
