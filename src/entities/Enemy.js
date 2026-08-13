import Phaser from 'phaser';

const PATROL_SPEED = 80;

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolRange) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(32, 32);
    this.body.setAllowGravity(true);
    this.body.setImmovable(false);

    this.startX = x;
    this.patrolRange = patrolRange;
    this.direction = 1;
    this.alive = true;
    this.setVelocityX(PATROL_SPEED);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.alive) {
      return;
    }

    const leftBound = this.startX - this.patrolRange;
    const rightBound = this.startX + this.patrolRange;

    if (this.x <= leftBound) {
      this.direction = 1;
      this.setVelocityX(PATROL_SPEED);
    } else if (this.x >= rightBound) {
      this.direction = -1;
      this.setVelocityX(-PATROL_SPEED);
    }

    if (this.body.blocked.left || this.body.blocked.right) {
      this.direction *= -1;
      this.setVelocityX(PATROL_SPEED * this.direction);
    }

    this.setFlipX(this.direction < 0);
  }

  defeat() {
    if (!this.alive) {
      return;
    }

    this.alive = false;
    this.body.enable = false;
    this.setActive(false);
    this.setVisible(false);
  }
}
