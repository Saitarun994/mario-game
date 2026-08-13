const VIEWPORT_WIDTH = 800;
const VIEWPORT_HEIGHT = 600;
const SKY_BANDS = 20;

const SKY_TOP = { r: 70, g: 38, b: 112 };
const SKY_BOTTOM = { r: 244, g: 135, b: 80 };

const MOUNTAIN_LAYERS = [
  {
    color: 0x70507f,
    depth: -30,
    scrollFactor: 0.1,
    horizon: 360,
    widths: [520, 640, 560],
    heights: [145, 195, 165],
  },
  {
    color: 0x513861,
    depth: -20,
    scrollFactor: 0.25,
    horizon: 415,
    widths: [440, 560, 500],
    heights: [150, 210, 175],
  },
  {
    color: 0x30233f,
    depth: -10,
    scrollFactor: 0.45,
    horizon: 475,
    widths: [360, 480, 420],
    heights: [135, 190, 155],
  },
];

function interpolateColor(from, to, amount) {
  const channel = (name) =>
    Math.round(from[name] + (to[name] - from[name]) * amount);

  return (channel('r') << 16) | (channel('g') << 8) | channel('b');
}

export default class SunsetBackground {
  constructor(scene, levelWidth) {
    this.scene = scene;
    this.levelWidth = levelWidth;

    this.sky = this.createSky();
    this.sun = this.createSun();
    this.clouds = this.createClouds();
    this.mountains = MOUNTAIN_LAYERS.map((config) =>
      this.createMountainLayer(config)
    );
  }

  createSky() {
    const graphics = this.scene.add.graphics();
    const bandHeight = VIEWPORT_HEIGHT / SKY_BANDS;

    for (let band = 0; band < SKY_BANDS; band += 1) {
      const amount = band / (SKY_BANDS - 1);
      graphics.fillStyle(interpolateColor(SKY_TOP, SKY_BOTTOM, amount));
      graphics.fillRect(
        0,
        band * bandHeight,
        VIEWPORT_WIDTH,
        bandHeight
      );
    }

    return graphics.setScrollFactor(0).setDepth(-100);
  }

  createSun() {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0xffd27a, 0.22);
    graphics.fillCircle(650, 145, 72);
    graphics.fillStyle(0xffc45c, 0.95);
    graphics.fillCircle(650, 145, 56);

    return graphics.setScrollFactor(0).setDepth(-90);
  }

  createClouds() {
    const graphics = this.scene.add.graphics();
    const cameraTravel = Math.max(0, this.levelWidth - VIEWPORT_WIDTH);
    const cloudSpan = VIEWPORT_WIDTH + cameraTravel * 0.15;
    const clouds = [
      { x: 110, y: 125, scale: 0.85 },
      { x: cloudSpan * 0.31, y: 205, scale: 1.05 },
      { x: cloudSpan * 0.53, y: 105, scale: 0.75 },
      { x: cloudSpan * 0.76, y: 180, scale: 1 },
      { x: cloudSpan - 90, y: 135, scale: 0.8 },
    ];

    graphics.fillStyle(0xffffff, 0.28);
    clouds.forEach(({ x, y, scale }) => {
      graphics.fillEllipse(x - 34 * scale, y + 5, 72 * scale, 28 * scale);
      graphics.fillEllipse(x, y - 5, 82 * scale, 40 * scale);
      graphics.fillEllipse(x + 38 * scale, y + 6, 66 * scale, 25 * scale);
    });

    return graphics.setScrollFactor(0.15).setDepth(-40);
  }

  createMountainLayer({
    color,
    depth,
    scrollFactor,
    horizon,
    widths,
    heights,
  }) {
    const graphics = this.scene.add.graphics();
    const startX = -400;
    const endX = this.levelWidth + VIEWPORT_WIDTH;

    graphics.fillStyle(color);
    graphics.beginPath();
    graphics.moveTo(startX, VIEWPORT_HEIGHT);
    graphics.lineTo(startX, horizon);

    let x = startX;
    let peakIndex = 0;
    while (x < endX) {
      const width = widths[peakIndex % widths.length];
      const height = heights[peakIndex % heights.length];
      graphics.lineTo(x + width * 0.48, horizon - height);
      x += width;
      graphics.lineTo(x, horizon);
      peakIndex += 1;
    }

    graphics.lineTo(x, VIEWPORT_HEIGHT);
    graphics.closePath();
    graphics.fillPath();

    return graphics.setScrollFactor(scrollFactor).setDepth(depth);
  }
}
