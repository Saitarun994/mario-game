# Gameplay Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add score, collectible coins, an always-available double jump, a 6,000-pixel level, and a code-drawn Sunset Peaks background to the existing Phaser platformer.

**Architecture:** Keep level content in `level1.js`, gameplay orchestration in `GameScene`, and focused rendering or entity behavior in small classes. Score state remains owned by each `GameScene` run, while pure scoring functions make point rules easy to test.

**Tech Stack:** JavaScript ES modules, Phaser 3.80, Vite 5, Vitest

## Global Constraints

- The level width is exactly 6,000 pixels.
- Include exactly 25 reachable coins and 5 patrolling enemies.
- Award 100 points per coin and 200 points per enemy stomp.
- Provide one ground jump and one air jump; landing restores the air jump.
- Preserve coyote time, jump buffering, variable jump height, instant game over, flag victory, and `R` restart.
- Draw Sunset Peaks with Phaser shapes only; add no external art or audio.
- Reset score and coin count to zero on every new run.
- Do not create commits unless the user explicitly requests them.

## File Map

- Create `src/gameplay/scoring.js`: pure score-state transitions and point constants.
- Create `src/entities/Coin.js`: coin sprite, physics body, tween, and one-time collection.
- Create `src/ui/ScoreDisplay.js`: fixed-camera HUD.
- Create `src/rendering/SunsetBackground.js`: fixed sky and parallax scenery.
- Create `tests/scoring.test.js`: score-rule tests.
- Create `tests/level1.test.js`: level-size and content-count tests.
- Modify `package.json`: add Vitest and a `test` script.
- Modify `src/scenes/BootScene.js`: generate the gold coin texture.
- Modify `src/config/level1.js`: 6,000-pixel level data.
- Modify `src/entities/Player.js`: double-jump state.
- Modify `src/scenes/GameScene.js`: integrate level width, scenery, coins, score, and stomp points.

---

### Task 1: Scoring Model, Coin Entity, and HUD

**Files:**
- Modify: `package.json`
- Create: `src/gameplay/scoring.js`
- Create: `src/entities/Coin.js`
- Create: `src/ui/ScoreDisplay.js`
- Create: `tests/scoring.test.js`
- Modify: `src/scenes/BootScene.js`
- Modify: `src/scenes/GameScene.js`

**Interfaces:**
- `createScoreState(): { score: number, coins: number }`
- `awardCoin(state): { score: number, coins: number }`
- `awardStomp(state): { score: number, coins: number }`
- `new Coin(scene, x, y)` exposes `collect(): boolean`; it returns `true` exactly once.
- `new ScoreDisplay(scene)` exposes `update(state): void`.

- [ ] **Step 1: Install and configure Vitest**

Run:

```bash
npm install --save-dev vitest
```

Add `"test": "vitest run"` to `scripts` in `package.json`.

- [ ] **Step 2: Write failing scoring tests**

Create `tests/scoring.test.js`:

```js
import { describe, expect, it } from 'vitest';
import {
  awardCoin,
  awardStomp,
  createScoreState,
} from '../src/gameplay/scoring.js';

describe('scoring', () => {
  it('starts a run at zero', () => {
    expect(createScoreState()).toEqual({ score: 0, coins: 0 });
  });

  it('awards 100 points and one coin', () => {
    expect(awardCoin(createScoreState())).toEqual({ score: 100, coins: 1 });
  });

  it('awards 200 points without changing coins for a stomp', () => {
    expect(awardStomp({ score: 100, coins: 1 })).toEqual({
      score: 300,
      coins: 1,
    });
  });
});
```

- [ ] **Step 3: Run the tests and confirm failure**

Run: `npm test`

Expected: FAIL because `src/gameplay/scoring.js` does not exist.

- [ ] **Step 4: Implement pure scoring rules**

Create `src/gameplay/scoring.js`:

```js
export const COIN_POINTS = 100;
export const STOMP_POINTS = 200;

export function createScoreState() {
  return { score: 0, coins: 0 };
}

export function awardCoin(state) {
  return {
    score: state.score + COIN_POINTS,
    coins: state.coins + 1,
  };
}

export function awardStomp(state) {
  return {
    score: state.score + STOMP_POINTS,
    coins: state.coins,
  };
}
```

- [ ] **Step 5: Run scoring tests**

Run: `npm test`

Expected: all three scoring tests PASS.

- [ ] **Step 6: Implement one-time coin collection**

Create `Coin.js` as an Arcade sprite using a generated `coin` texture. Start a looping vertical yoyo tween. Implement `collect()` to return `false` if already collected; otherwise mark collected, stop the tween, disable the physics body, hide the sprite, and return `true`.

Core method:

```js
collect() {
  if (this.collected) return false;
  this.collected = true;
  this.floatTween.stop();
  this.disableBody(true, true);
  return true;
}
```

- [ ] **Step 7: Implement the fixed score display**

Create `ScoreDisplay.js` with two text objects at `(20, 18)` and `(20, 50)`. Use white 24-pixel text, a dark four-pixel shadow, depth `100`, and `setScrollFactor(0)`. Its `update(state)` method sets `Score: ${state.score}` and `Coins: ${state.coins}`.

- [ ] **Step 8: Integrate coins and scoring**

In `BootScene.create()`, generate a 20-by-20 gold circular `coin` texture before starting `GameScene`:

```js
const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
coinGraphics.fillStyle(0xffd700);
coinGraphics.fillCircle(10, 10, 9);
coinGraphics.lineStyle(2, 0xfff2a8);
coinGraphics.strokeCircle(10, 10, 9);
coinGraphics.generateTexture('coin', 20, 20);
coinGraphics.destroy();
```

In `GameScene.create()`:

```js
this.scoreState = createScoreState();
this.scoreDisplay = new ScoreDisplay(this);
this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
level1.coins.forEach(({ x, y }) => this.coins.add(new Coin(this, x, y)));
this.physics.add.overlap(this.player, this.coins, this.handleCoin, null, this);
```

Add:

```js
handleCoin(_player, coin) {
  if (this.gameEnded || !coin.collect()) return;
  this.scoreState = awardCoin(this.scoreState);
  this.scoreDisplay.update(this.scoreState);
}
```

After `enemy.defeat()` succeeds in the stomp branch, call `awardStomp` and update the HUD.

- [ ] **Step 9: Verify the task**

Run: `npm test && npm run build`

Expected: scoring tests PASS and Vite production build succeeds.

### Task 2: Always-Available Double Jump

**Files:**
- Modify: `src/entities/Player.js`

**Interfaces:**
- `Player` maintains `airJumpAvailable: boolean`.
- Ground contact sets `airJumpAvailable = true`.
- A valid ground/coyote jump does not consume the air jump.
- A new jump press while airborne consumes the air jump.

- [ ] **Step 1: Add double-jump state**

Initialize `this.airJumpAvailable = true` in the constructor. In `preUpdate`, when `onGround` is true, restore it to `true`.

- [ ] **Step 2: Separate first-jump and air-jump decisions**

Replace the current single jump condition with:

```js
if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
  this.setVelocityY(JUMP_VELOCITY);
  this.jumpBufferTimer = 0;
  this.coyoteTimer = 0;
} else if (jumpPressed && !onGround && this.airJumpAvailable) {
  this.setVelocityY(JUMP_VELOCITY);
  this.jumpBufferTimer = 0;
  this.airJumpAvailable = false;
}
```

Keep the existing jump-release velocity cut so either jump has variable height.

- [ ] **Step 3: Verify jump behavior in the browser**

Run: `npm run dev`

Check:

1. Ground jump works.
2. One new jump press while airborne works.
3. A third jump press does nothing.
4. Landing restores one air jump.
5. Walking off a platform still permits a coyote jump and then one air jump.
6. Releasing jump early shortens either jump.

- [ ] **Step 4: Verify the build**

Run: `npm run build`

Expected: production build succeeds.

### Task 3: Build the 6,000-Pixel Level

**Files:**
- Modify: `src/config/level1.js`
- Create: `tests/level1.test.js`
- Modify: `src/scenes/GameScene.js`

**Interfaces:**
- `level1.width: number`
- `level1.platforms: Array<{ x, y, width, height }>`
- `level1.coins: Array<{ x, y }>`
- `level1.enemies: Array<{ x, y, patrolRange }>`

- [ ] **Step 1: Write failing level-shape tests**

Create `tests/level1.test.js`:

```js
import { describe, expect, it } from 'vitest';
import level1 from '../src/config/level1.js';

describe('expanded level', () => {
  it('has the required dimensions and content', () => {
    expect(level1.width).toBe(6000);
    expect(level1.coins).toHaveLength(25);
    expect(level1.enemies).toHaveLength(5);
  });

  it('keeps all objects inside the level', () => {
    expect(level1.flag.x).toBeLessThan(level1.width);
    for (const coin of level1.coins) {
      expect(coin.x).toBeGreaterThan(0);
      expect(coin.x).toBeLessThan(level1.width);
    }
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run: `npm test`

Expected: FAIL because `width` and `coins` are missing and only one enemy exists.

- [ ] **Step 3: Define expanded level data**

Set `width: 6000`. Add ground segments separated by jumpable gaps, floating platforms that provide optional routes, 25 coin positions, and 5 enemy definitions. Keep every enemy's full patrol interval over a solid ground segment. Place the flag between x=5800 and x=5900.

- [ ] **Step 4: Remove hard-coded world width**

Delete `LEVEL_WIDTH` from `GameScene.js`. Use `level1.width` in:

```js
this.physics.world.setBounds(0, 0, level1.width, 600);
this.cameras.main.setBounds(0, 0, level1.width, 600);
```

- [ ] **Step 5: Run automated checks**

Run: `npm test && npm run build`

Expected: scoring and level tests PASS; production build succeeds.

- [ ] **Step 6: Play through the full level**

Verify every gap is traversable, all 25 coins are reachable, all 5 enemies remain on their intended platforms, and the flag can be reached.

### Task 4: Sunset Peaks Background

**Files:**
- Create: `src/rendering/SunsetBackground.js`
- Modify: `src/scenes/GameScene.js`

**Interfaces:**
- `new SunsetBackground(scene, levelWidth)` creates all scenery.
- Background objects use negative depth and have no physics bodies.

- [ ] **Step 1: Implement the fixed sky**

Create a full-viewport purple-to-orange gradient using horizontal bands or a generated canvas texture. Set it to `scrollFactor(0)` and depth `-100`. Add a warm circular sun at the upper-right with `scrollFactor(0)`.

- [ ] **Step 2: Implement parallax mountain layers**

Create three repeated mountain silhouette layers spanning enough virtual width to cover camera travel. Use purple tones from light to dark, depths `-30`, `-20`, and `-10`, and scroll factors `0.1`, `0.25`, and `0.45`.

- [ ] **Step 3: Add sparse clouds**

Compose each cloud from two or three translucent white ellipses. Place a small set across the virtual level with scroll factor `0.15` and depth `-40`.

- [ ] **Step 4: Integrate scenery**

At the beginning of `GameScene.create()`, before platforms and entities:

```js
this.background = new SunsetBackground(this, level1.width);
```

- [ ] **Step 5: Verify visuals**

Run: `npm run dev`.

Confirm that the sky always fills the camera, mountains move at distinct rates, no scenery covers platforms or the HUD, and the background remains continuous through x=6000.

- [ ] **Step 6: Verify the build**

Run: `npm run build`

Expected: production build succeeds.

### Task 5: Full Regression and Completion Check

**Files:**
- Modify only files needed to correct issues found during verification.

- [ ] **Step 1: Run automated verification**

Run:

```bash
npm test
npm run build
```

Expected: all tests pass and Vite reports a successful production build.

- [ ] **Step 2: Verify scoring lifecycle**

Collect a coin, stomp an enemy, and confirm the HUD shows `Score: 300` and `Coins: 1`. Die and restart; confirm both values return to zero.

- [ ] **Step 3: Verify collision safeguards**

Confirm a coin cannot score twice, a defeated enemy cannot score twice, enemy side contact loses immediately, and callbacks do not change score after win or loss.

- [ ] **Step 4: Verify complete gameplay**

Play from spawn to the flag, using both normal and double jumps. Confirm all level sections are traversable, camera bounds cover the full level, the goal triggers, and `R` restarts.

- [ ] **Step 5: Check scope**

Confirm no external assets, audio, persistence, menus, lives, power-ups, timer, or completion bonus were added.
