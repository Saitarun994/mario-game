import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createPlaceholderTexture('player', 32, 32, 0x3366ff);
    this.createPlaceholderTexture('enemy', 32, 32, 0xff3333);

    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    coinGraphics.fillStyle(0xffd700);
    coinGraphics.fillCircle(10, 10, 9);
    coinGraphics.lineStyle(2, 0xfff2a8);
    coinGraphics.strokeCircle(10, 10, 9);
    coinGraphics.generateTexture('coin', 20, 20);
    coinGraphics.destroy();

    this.scene.start('GameScene');
  }

  createPlaceholderTexture(key, width, height, color) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color);
    graphics.fillRect(0, 0, width, height);
    graphics.generateTexture(key, width, height);
    graphics.destroy();
  }
}
