import Phaser from 'phaser';

const SPEED = 200;
const JUMP_VELOCITY = -400;
const COYOTE_TIME_MS = 100;
const JUMP_BUFFER_MS = 100;
const JUMP_CUT_MULTIPLIER = 0.5;

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setSize(32, 32);
    this.body.setCollideWorldBounds(false);

    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
    this.wasOnGround = false;
    this.airJumpAvailable = true;

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.keys = scene.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const onGround = this.body.blocked.down || this.body.touching.down;

    if (onGround) {
      this.coyoteTimer = COYOTE_TIME_MS;
      this.airJumpAvailable = true;
    } else if (this.wasOnGround) {
      this.coyoteTimer = Math.max(this.coyoteTimer - delta, 0);
    } else {
      this.coyoteTimer = Math.max(this.coyoteTimer - delta, 0);
    }

    this.wasOnGround = onGround;

    const jumpUpJustDown = Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const jumpWJustDown = Phaser.Input.Keyboard.JustDown(this.keys.W);
    const jumpSpaceJustDown = Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    const jumpPressed = jumpUpJustDown || jumpWJustDown || jumpSpaceJustDown;

    if (jumpPressed) {
      this.jumpBufferTimer = JUMP_BUFFER_MS;
    } else {
      this.jumpBufferTimer = Math.max(this.jumpBufferTimer - delta, 0);
    }

    const left =
      this.cursors.left.isDown || this.keys.A.isDown;
    const right =
      this.cursors.right.isDown || this.keys.D.isDown;

    if (left) {
      this.setVelocityX(-SPEED);
    } else if (right) {
      this.setVelocityX(SPEED);
    } else {
      this.setVelocityX(0);
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.setVelocityY(JUMP_VELOCITY);
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    } else if (jumpPressed && !onGround && this.airJumpAvailable) {
      this.setVelocityY(JUMP_VELOCITY);
      this.jumpBufferTimer = 0;
      this.airJumpAvailable = false;
    }

    const jumpReleased =
      Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.keys.W) ||
      Phaser.Input.Keyboard.JustUp(this.keys.SPACE);

    if (jumpReleased && this.body.velocity.y < 0) {
      this.setVelocityY(this.body.velocity.y * JUMP_CUT_MULTIPLIER);
    }
  }

  isFalling() {
    return this.body.velocity.y > 0;
  }
}
