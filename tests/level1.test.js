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

  it('places every coin before the flag can end the run', () => {
    const finalCoinX = Math.max(...level1.coins.map(({ x }) => x));

    expect(finalCoinX).toBeLessThan(level1.flag.x - 30);
  });

  it('keeps every platform inside the level', () => {
    for (const platform of level1.platforms) {
      expect(platform.x).toBeGreaterThanOrEqual(0);
      expect(platform.x + platform.width).toBeLessThanOrEqual(level1.width);
    }
  });

  it('supports each enemy patrol interval with solid ground', () => {
    const enemyHalfWidth = 16;

    for (const enemy of level1.enemies) {
      const patrolLeft = enemy.x - enemy.patrolRange - enemyHalfWidth;
      const patrolRight = enemy.x + enemy.patrolRange + enemyHalfWidth;
      const supportingPlatform = level1.platforms.find(
        (platform) =>
          platform.y >= enemy.y &&
          platform.y - enemy.y <= 50 &&
          platform.x <= patrolLeft &&
          platform.x + platform.width >= patrolRight
      );

      expect(supportingPlatform).toBeDefined();
    }
  });
});
