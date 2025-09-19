import { DifficultyConfig, DifficultyLevel } from '../types';

const difficultyPresets: Record<DifficultyLevel, DifficultyConfig> = {
  easy: {
    arithmetic: { duration: 60, range: [1, 9], operations: ['+', '-'] },
    memory: { revealMs: 2000, startLength: 4 },
    reaction: { trials: 5, minDelay: 800, maxDelay: 1600 },
    oddOneOut: { duration: 90 }
  },
  normal: {
    arithmetic: { duration: 60, range: [1, 12], operations: ['+', '-', '*'] },
    memory: { revealMs: 1800, startLength: 5 },
    reaction: { trials: 5, minDelay: 700, maxDelay: 1500 },
    oddOneOut: { duration: 80 }
  },
  hard: {
    arithmetic: { duration: 60, range: [2, 15], operations: ['+', '-', '*', '/'] },
    memory: { revealMs: 1600, startLength: 6 },
    reaction: { trials: 6, minDelay: 600, maxDelay: 1200 },
    oddOneOut: { duration: 70 }
  }
};

export const getDifficultyConfig = (level: DifficultyLevel): DifficultyConfig => difficultyPresets[level];
