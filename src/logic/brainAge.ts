import { TestKind } from '../types';
import { estimateBrainAge } from './scoring';

export const calculateBrainAge = (scores: Record<TestKind, number>) => estimateBrainAge(scores);
