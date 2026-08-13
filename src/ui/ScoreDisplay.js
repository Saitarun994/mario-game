export default class ScoreDisplay {
  constructor(scene) {
    const style = {
      fontSize: '24px',
      color: '#ffffff',
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000000',
        blur: 0,
        fill: true,
      },
    };

    this.scoreText = scene.add.text(20, 18, 'Score: 0', style);
    this.coinText = scene.add.text(20, 50, 'Coins: 0', style);

    this.scoreText.setScrollFactor(0).setDepth(100);
    this.coinText.setScrollFactor(0).setDepth(100);
  }

  update(state) {
    this.scoreText.setText(`Score: ${state.score}`);
    this.coinText.setText(`Coins: ${state.coins}`);
  }
}
