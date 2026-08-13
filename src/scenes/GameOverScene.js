import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.won = data.won ?? false;
  }

  create() {
    this.cameras.main.setScroll(0, 0);

    const message = this.won ? 'You Win!' : 'Game Over';
    const color = this.won ? '#ffdd00' : '#ff4444';

    this.add
      .text(400, 240, message, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '64px',
        color,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(400, 340, 'Press R to restart', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    this.input.keyboard.once('keydown-R', () => {
      this.scene.start('GameScene');
    });
  }
}
