import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createPlayerTexture();
    this.createEnemyTexture();

    const coinGraphics = this.make.graphics({ x: 0, y: 0, add: false });
    coinGraphics.fillStyle(0xffd700);
    coinGraphics.fillCircle(10, 10, 9);
    coinGraphics.lineStyle(2, 0xfff2a8);
    coinGraphics.strokeCircle(10, 10, 9);
    coinGraphics.generateTexture('coin', 20, 20);
    coinGraphics.destroy();

    this.scene.start('GameScene');
  }

  createPlayerTexture() {
    this.createPixelTexture('player', {
      r: 0xe52521,
      s: 0xf4c7a1,
      h: 0x6b3a1f,
      b: 0x1e4db7,
      y: 0xffd54a,
      w: 0xffffff,
    }, [
      '....rrrrrr....',
      '...rrrrrrrrr..',
      '...hhhsssh....',
      '..hshssshsss..',
      '..hshsssshsss.',
      '..hhssssshhh..',
      '....sssssss...',
      '...rrbbbrrr...',
      '..rrrbbbrrrr..',
      '.rrrrbbbbbrrr.',
      'www.bybbyb.www',
      'ww..bbbbbb..ww',
      '....bb..bb....',
      '...hh....hh...',
      '..hhh....hhh..',
      '..............',
    ]);
  }

  createEnemyTexture() {
    this.createPixelTexture('enemy', {
      b: 0xc47a3a,
      d: 0x8b4a1f,
      t: 0xe8c090,
      k: 0x1a1a1a,
      w: 0xffffff,
    }, [
      '......bbbb......',
      '....bbbbbbbb....',
      '...bbbbbbbbbb...',
      '..bbbbbbbbbbbb..',
      '.bbwwbbddwwbbbb.',
      '.bkkbbddkkbbbbb.',
      '.bbbbbbbbbbbbbb.',
      '.bbbbbbbbbbbbbb.',
      '..dbbbbbbbbbbd..',
      '....tttttttt....',
      '.....tt..tt.....',
      '....kk....kk....',
      '...kkk....kkk...',
      '................',
      '................',
      '................',
    ]);
  }

  createPixelTexture(key, palette, pixels, scale = 2) {
    const width = pixels[0].length * scale;
    const height = pixels.length * scale;
    const canvas = this.textures.createCanvas(key, width, height);
    const ctx = canvas.getContext();
    ctx.clearRect(0, 0, width, height);

    pixels.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        const color = palette[cell];
        if (color == null) {
          return;
        }

        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      });
    });

    canvas.refresh();
  }
}
