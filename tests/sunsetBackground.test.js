import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

class FakeGraphics {
  constructor() {
    this.depth = 0;
    this.scrollFactor = { x: 1, y: 1 };
    this.commands = [];
  }

  setDepth(depth) {
    this.depth = depth;
    return this;
  }

  setScrollFactor(x, y = x) {
    this.scrollFactor = { x, y };
    return this;
  }

  fillStyle(color, alpha = 1) {
    this.commands.push({ type: 'fillStyle', color, alpha });
    return this;
  }

  fillRect(x, y, width, height) {
    this.commands.push({ type: 'fillRect', x, y, width, height });
    return this;
  }

  fillCircle(x, y, radius) {
    this.commands.push({ type: 'fillCircle', x, y, radius });
    return this;
  }

  fillEllipse(x, y, width, height) {
    this.commands.push({ type: 'fillEllipse', x, y, width, height });
    return this;
  }

  beginPath() {
    this.commands.push({ type: 'beginPath' });
    return this;
  }

  moveTo(x, y) {
    this.commands.push({ type: 'moveTo', x, y });
    return this;
  }

  lineTo(x, y) {
    this.commands.push({ type: 'lineTo', x, y });
    return this;
  }

  closePath() {
    this.commands.push({ type: 'closePath' });
    return this;
  }

  fillPath() {
    this.commands.push({ type: 'fillPath' });
    return this;
  }
}

function createFakeScene() {
  const graphics = [];

  return {
    graphics,
    scene: {
      scale: { width: 800, height: 600 },
      add: {
        graphics() {
          const object = new FakeGraphics();
          graphics.push(object);
          return object;
        },
      },
    },
  };
}

describe('SunsetBackground', () => {
  it('draws fixed sky and sun plus negative-depth parallax scenery', async () => {
    const { default: SunsetBackground } = await import(
      '../src/rendering/SunsetBackground.js'
    );
    const { scene, graphics } = createFakeScene();

    new SunsetBackground(scene, 6000);

    expect(graphics).toHaveLength(6);

    const [sky, sun, clouds, ...mountains] = graphics;
    expect([sky.depth, sun.depth]).toEqual([-100, -90]);
    expect([sky.scrollFactor, sun.scrollFactor]).toEqual([
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ]);

    const skyRects = sky.commands.filter(({ type }) => type === 'fillRect');
    expect(skyRects[0]).toMatchObject({ x: 0, y: 0, width: 800 });
    expect(skyRects.at(-1).y + skyRects.at(-1).height).toBe(600);
    expect(sun.commands.some(({ type }) => type === 'fillCircle')).toBe(true);

    expect(clouds.depth).toBe(-40);
    expect(clouds.scrollFactor).toEqual({ x: 0.15, y: 0.15 });
    expect(
      clouds.commands.filter(({ type }) => type === 'fillEllipse').length
    ).toBeGreaterThanOrEqual(9);

    expect(mountains.map(({ depth }) => depth)).toEqual([-30, -20, -10]);
    expect(mountains.map(({ scrollFactor }) => scrollFactor.x)).toEqual([
      0.1, 0.25, 0.45,
    ]);

    mountains.forEach((layer) => {
      const points = layer.commands.filter(({ type }) =>
        ['moveTo', 'lineTo'].includes(type)
      );
      expect(Math.min(...points.map(({ x }) => x))).toBeLessThanOrEqual(0);
      expect(Math.max(...points.map(({ x }) => x))).toBeGreaterThanOrEqual(
        6800
      );
      expect(layer.commands.some(({ type }) => type === 'fillPath')).toBe(true);
    });
  });

  it('is created before gameplay objects in GameScene', () => {
    const source = readFileSync(
      new URL('../src/scenes/GameScene.js', import.meta.url),
      'utf8'
    );

    expect(source).toContain(
      "import SunsetBackground from '../rendering/SunsetBackground.js';"
    );

    const backgroundIndex = source.indexOf(
      'this.background = new SunsetBackground(this, level1.width);'
    );
    const platformsIndex = source.indexOf(
      'this.platforms = this.physics.add.staticGroup();'
    );
    const playerIndex = source.indexOf('this.player = new Player(');

    expect(backgroundIndex).toBeGreaterThan(-1);
    expect(backgroundIndex).toBeLessThan(platformsIndex);
    expect(backgroundIndex).toBeLessThan(playerIndex);
  });
});
