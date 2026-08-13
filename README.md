# Super Mario Bros MVP

A browser-based side-scrolling platformer built with **Phaser 3** and **Vite**. Run across a long level, collect coins, stomp enemies, and reach the flag to win. Sprites are simple colored placeholders; gameplay focuses on movement, collision, scoring, and level flow.

## Implemented features

- **6,000-pixel level** with ground segments, floating platforms, a goal flag, and a following camera
- **25 collectible coins** with a floating animation
- **5 patrolling enemies** that can be stomped from above
- **Score HUD** (top-left) showing total score and coins collected
- **Double jump** — ground jump plus one mid-air jump; also includes coyote time, jump buffering, and variable jump height
- **Win / lose flow** — touch the flag to win; lose by hitting an enemy from the side or falling off the level; press **R** on the result screen to restart
- **Keyboard controls** — arrow keys or WASD to move; Up, W, or Space to jump
- **Procedural sunset background** — gradient sky, sun, clouds, and parallax mountain layers drawn at runtime (no image files)

## Prerequisites

- [Node.js](https://nodejs.org/) **18+** (LTS recommended)
- npm (included with Node.js)

## Install and run

```bash
npm install
npm run dev
```

Opens a local dev server (usually `http://localhost:5173`) with hot reload.

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build a static site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run Vitest unit tests |

## Controls

| Action | Keys |
|--------|------|
| Move left | `←` or `A` |
| Move right | `→` or `D` |
| Jump | `↑`, `W`, or `Space` |
| Restart (after win/loss) | `R` |

## Scoring

| Event | Points |
|-------|--------|
| Collect a coin | +100 |
| Stomp an enemy | +200 |

The HUD updates immediately when you collect a coin or stomp an enemy. Score and coin count are tracked separately.

## How to play

1. Start on the left side of the level.
2. Jump across platforms and gaps; use your second jump in mid-air when needed.
3. Collect coins for points.
4. Stomp enemies by landing on them while falling; touching them from the side ends the run.
5. Reach the yellow flag at the far right to win.
6. Falling below the level (`y > 650`) also ends the run.

## Project structure

```
mario-game/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── tests/
│   ├── level1.test.js
│   └── sunsetBackground.test.js
└── src/
    ├── main.js                 # Phaser game entry point
    ├── config/
    │   ├── gameConfig.js       # Canvas, physics, scene list
    │   └── level1.js           # Level width, platforms, coins, enemies, flag, spawn
    ├── scenes/
    │   ├── BootScene.js        # Generates placeholder textures
    │   ├── GameScene.js        # Main gameplay loop
    │   └── GameOverScene.js    # Win/lose screen and restart
    ├── entities/
    │   ├── Player.js           # Movement, double jump, input
    │   ├── Enemy.js            # Patrol AI and defeat
    │   └── Coin.js             # Collectible pickup
    ├── gameplay/
    │   └── scoring.js          # Score and coin point values
    ├── ui/
    │   └── ScoreDisplay.js     # On-screen score HUD
    └── rendering/
        └── SunsetBackground.js # Procedural parallax background
```

## Current limitations

- **Single level only** — no level select or progression
- **Placeholder graphics** — colored rectangles and circles, not sprite sheets or tilemaps
- **Keyboard only** — no touch or gamepad support
- **No audio** — no sound effects or music
- **No persistence** — scores reset when you restart or refresh the page
- **Arcade physics only** — simple AABB collisions (no slopes, ladders, or power-ups)

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `npm` / `vite` not found | Install Node.js 18+, reopen the terminal, run `npm install` |
| Blank page | Check the browser console; confirm you run commands from the `mario-game` folder |
| Port in use | Vite will pick another port, or stop the process using 5173 |
