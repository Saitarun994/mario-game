export const COIN_POINTS = 100;
export const STOMP_POINTS = 200;

export function createScoreState() {
  return { score: 0, coins: 0 };
}

export function awardCoin(state) {
  return {
    score: state.score + COIN_POINTS,
    coins: state.coins + 1,
  };
}

export function awardStomp(state) {
  return {
    score: state.score + STOMP_POINTS,
    coins: state.coins,
  };
}
