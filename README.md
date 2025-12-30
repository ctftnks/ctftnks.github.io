# CTF-TNKS: Capture-the-flag Tank game

CTF-TNKS is a fast-paced, tank battle browser game featuring multiple game modes, including Capture the Flag, Deathmatch, and King of the Hill. It is built with modern vanilla web technologies.

## 🛠 Features

- **Multiple Game Modes:** CTF, Deathmatch, Team Deathmatch, King of the Hill, and a built-in Map Editor.
- **Smart AI Bots:** Adaptive bot speed and strategic behavior.
- **Dynamic Power-ups:** Laser, Machine Gun, Guided Missiles, Wrecking Ball, and more.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)

### Installation of dependencies

First, you need to install the npm-dependencies using the command

```bash
npm install
```

### Development

Launch the development server:

```bash
npm run dev
```

The game should now be available in your browser at [http://localhost:5173](http://localhost:5173)

### Build

Build the project for production:

```bash
npm run build
```

The output will be generated in the `dist/` directory.

### Testing

Run the unit test suite:

```bash
npm test
```

## 🎮 How to Play

1. **Menu:** Use the menu to select a game mode and configure players/bots.
2. **Controls:** Default controls for Player 1 are Arrow Keys to move and Space to fire. These can be remapped in the Menu.
3. **Goal:** Capture the enemy flag and return it to your base while defending your own!
