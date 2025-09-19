import { TestKind } from '../types';

export const scoreArithmetic = (correct: number, mistakes: number, timeLeft: number) => {
  const timeBonus = Math.max(0, Math.round(timeLeft * 2));
  return Math.max(0, correct * 10 - mistakes * 5 + timeBonus);
};

export const scoreMemory = (longest: number, accuracy: number) => {
  const cappedAccuracy = Math.max(0, Math.min(1, accuracy));
  return Math.round(longest * 15 + cappedAccuracy * 10 * longest);
};

export const scoreReaction = (medianMs: number) => {
  const base = Math.max(0, 500 - medianMs);
  return Math.round((base / 500) * 500);
};

export const scoreOddOneOut = (correct: number, mistakes: number, timeLeft: number) => {
  const timeBonus = Math.max(0, Math.round(timeLeft));
  return Math.max(0, correct * 12 - mistakes * 6 + timeBonus);
};

const baselines: Record<TestKind, number> = {
  arithmetic: 420,
  memory: 360,
  reaction: 280,
  oddOneOut: 400
};

const spreads: Record<TestKind, number> = {
  arithmetic: 110,
  memory: 90,
  reaction: 100,
  oddOneOut: 95
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normaliseScore = (score: number, kind: TestKind) => {
  const base = baselines[kind];
  const spread = spreads[kind];
  return (score - base) / spread;
};

export const estimateBrainAge = (scores: Record<TestKind, number>) => {
  const zScores = Object.entries(scores).map(([kind, score]) =>
    normaliseScore(score, kind as TestKind)
  );
  const aggregate = zScores.reduce((sum, value) => sum + value, 0) / zScores.length;
  const mapped = 40 - aggregate * 12 + 30;
  return Math.round(clamp(mapped, 18, 80));
};

export const scoreFeedback = (score: number, kind: TestKind) => {
  const base = baselines[kind];
  if (score >= base + spreads[kind]) return 'positive';
  if (score >= base - spreads[kind] * 0.4) return 'neutral';
  return 'negative';
};
