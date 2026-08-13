# Gameplay Expansion Design

## Goal

Expand the existing Phaser platformer with scoring, collectible coins, an always-available double jump, a longer level, and a code-drawn Sunset Peaks background while keeping the game simple and asset-free.

## Scope

The expanded game has one 6,000-pixel level containing 25 coins and 5 patrolling enemies. The existing instant game-over behavior, flag goal, controls, and placeholder player and enemy graphics remain.

The expansion does not add external art assets, audio, persistence, menus, lives, power-ups, a timer, or a completion bonus.

## Architecture

The implementation extends the existing data-driven Phaser structure:

- `src/config/level1.js` becomes the source of truth for the level width, platforms, enemies, coins, spawn point, and flag.
- `src/entities/Coin.js` owns coin visuals, its floating animation, and disabling itself when collected.
- `src/ui/ScoreDisplay.js` owns fixed-camera score and coin-count text.
- `src/rendering/SunsetBackground.js` owns all code-drawn sky and parallax scenery.
- `src/entities/Player.js` owns double-jump state and resets it on landing.
- `src/scenes/GameScene.js` creates the background and level objects, coordinates collisions, and owns score state for the current run.

No global persistence is needed. Starting or restarting `GameScene` creates a fresh run with zero score and zero collected coins.

## Level

Increase the level width from 2,000 pixels to 6,000 pixels. Define varied ground segments, gaps, and floating platforms in `level1.js`. Place 25 reachable coins along the main route and optional platforming paths. Place 5 enemies with patrol ranges that do not send them into gaps. Put the flag near the far-right end.

`GameScene` reads `level1.width` for physics-world and camera bounds instead of using a hard-coded width.

## Scoring and Coins

Display two values in the top-left corner:

- `Score: 0`
- `Coins: 0`

Collecting a coin awards 100 points and increments the coin count by one. Stomping an enemy awards 200 points. A coin disables its physics body and visuals before emitting its collection result, preventing repeat scoring from overlapping physics callbacks.

The score display uses white text with a dark shadow and `scrollFactor(0)` so it remains readable and fixed while the camera moves.

## Double Jump

The player receives one ground jump and one air jump. Landing restores the air jump. Pressing jump while airborne consumes the air jump and applies the normal jump velocity.

Coyote time and jump buffering continue to support the first jump. The second jump triggers only on a new jump press, cannot be repeated before landing, and still supports variable jump height when the button is released.

## Sunset Peaks Background

Create the background from Phaser graphics and shapes in `SunsetBackground.js`. It contains:

- A purple-to-orange sunset sky
- A warm sun
- Three mountain silhouettes using progressively darker purple tones
- Sparse clouds

The sky stays fixed to the camera. Mountain layers move at different scroll factors to create parallax across the long level. Background objects remain behind all gameplay objects and do not participate in physics.

Coins are drawn as small gold circles and use a subtle looping float or pulse tween.

## Game Flow and Safeguards

The existing win and loss flow remains:

- Touch the flag to win.
- Touch an enemy from the side or below to lose.
- Fall below the level to lose.
- Press `R` on the result screen to restart.

Collection, enemy, and win callbacks return immediately after `gameEnded` becomes true. Defeated enemies and collected coins cannot award points more than once.

## Verification

Verify the following:

1. The production build succeeds.
2. Ground jump and one air jump both work.
3. Landing restores exactly one air jump.
4. Coyote time, jump buffering, and variable jump height still work.
5. Each coin awards 100 points and increments the coin count once.
6. Each enemy stomp awards 200 points once.
7. Side contact with an enemy still ends the run.
8. Death and restart reset score and coin count.
9. The score display stays fixed and readable while the camera scrolls.
10. Parallax layers move correctly and stay behind gameplay.
11. All coins are reachable and enemy patrol ranges are safe.
12. The full level can be completed from spawn to flag.
