import Phaser from 'phaser';
import level1 from '../config/level1.js';
import Player from '../entities/Player.js';
import Enemy from '../entities/Enemy.js';
import Coin from '../entities/Coin.js';
import ScoreDisplay from '../ui/ScoreDisplay.js';
import SunsetBackground from '../rendering/SunsetBackground.js';
import {
  createScoreState,
  awardCoin,
  awardStomp,
} from '../gameplay/scoring.js';

const DEATH_Y = 650;

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.background = new SunsetBackground(this, level1.width);

    this.gameEnded = false;
    this.enemies = [];
    this.scoreState = createScoreState();
    this.scoreDisplay = new ScoreDisplay(this);

    this.physics.world.setBounds(0, 0, level1.width, 600);

    this.platforms = this.physics.add.staticGroup();

    level1.platforms.forEach((platform, index) => {
      const color = index === 0 ? 0x8b4513 : 0x228b22;
      const rect = this.add.rectangle(
        platform.x + platform.width / 2,
        platform.y + platform.height / 2,
        platform.width,
        platform.height,
        color
      );
      this.physics.add.existing(rect, true);
      this.platforms.add(rect);
    });

    this.player = new Player(this, level1.spawn.x, level1.spawn.y);
    this.physics.add.collider(this.player, this.platforms);

    this.coins = this.physics.add.group({ allowGravity: false, immovable: true });
    (level1.coins ?? []).forEach(({ x, y }) => this.coins.add(new Coin(this, x, y)));
    this.physics.add.overlap(this.player, this.coins, this.handleCoin, null, this);

    level1.enemies.forEach((enemyData) => {
      const enemy = new Enemy(
        this,
        enemyData.x,
        enemyData.y,
        enemyData.patrolRange
      );
      this.enemies.push(enemy);
      this.physics.add.collider(enemy, this.platforms);
      this.physics.add.overlap(
        this.player,
        enemy,
        this.handlePlayerEnemyOverlap,
        null,
        this
      );
    });

    this.createFlag(level1.flag.x, level1.flag.y);

    this.physics.add.overlap(
      this.player,
      this.flagZone,
      this.handleWin,
      null,
      this
    );

    this.cameras.main.setBounds(0, 0, level1.width, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  createFlag(x, y) {
    const pole = this.add.rectangle(x, y - 20, 8, 80, 0x666666);
    const flag = this.add.rectangle(x + 20, y - 50, 40, 30, 0xffdd00);

    this.flagZone = this.add.zone(x + 10, y - 25, 50, 90);
    this.physics.add.existing(this.flagZone, true);
    this.flagZone.body.setSize(50, 90);

    pole.setDepth(1);
    flag.setDepth(2);
  }

  handlePlayerEnemyOverlap(player, enemy) {
    if (this.gameEnded || !enemy.alive) {
      return;
    }

    const playerBottom = player.y + player.displayHeight / 2;
    const enemyTop = enemy.y - enemy.displayHeight / 2;
    const falling = player.isFalling();
    const stompThreshold = 12;

    if (falling && playerBottom <= enemyTop + stompThreshold) {
      enemy.defeat();
      player.setVelocityY(-280);
      this.scoreState = awardStomp(this.scoreState);
      this.scoreDisplay.update(this.scoreState);
      return;
    }

    this.triggerGameOver(false);
  }

  handleCoin(_player, coin) {
    if (this.gameEnded || !coin.collect()) return;
    this.scoreState = awardCoin(this.scoreState);
    this.scoreDisplay.update(this.scoreState);
  }

  handleWin() {
    if (this.gameEnded) {
      return;
    }

    this.triggerGameOver(true);
  }

  triggerGameOver(won) {
    if (this.gameEnded) {
      return;
    }

    this.gameEnded = true;
    this.physics.pause();
    this.scene.start('GameOverScene', { won });
  }

  update() {
    if (this.gameEnded) {
      return;
    }

    if (this.player.y > DEATH_Y) {
      this.triggerGameOver(false);
    }
  }
}
