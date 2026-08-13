import { describe, expect, it } from 'vitest';
import {
  awardCoin,
  awardStomp,
  createScoreState,
} from '../src/gameplay/scoring.js';

describe('scoring', () => {
  it('starts a run at zero', () => {
    expect(createScoreState()).toEqual({ score: 0, coins: 0 });
  });

  it('awards 100 points and one coin', () => {
    expect(awardCoin(createScoreState())).toEqual({ score: 100, coins: 1 });
  });

  it('awards 200 points without changing coins for a stomp', () => {
    expect(awardStomp({ score: 100, coins: 1 })).toEqual({
      score: 300,
      coins: 1,
    });
  });
});
