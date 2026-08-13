import Phaser from 'phaser';

export default class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'coin');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.collected = false;

    this.floatTween = scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  collect() {
    if (this.collected) return false;
    this.collected = true;
    this.floatTween.stop();
    this.disableBody(true, true);
    this.setVisible(false);
    return true;
  }
}
