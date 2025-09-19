import { StreakState } from '../types';

const dayInMs = 24 * 60 * 60 * 1000;

export const updateStreak = (streak: StreakState, dateISO: string): StreakState => {
  const today = new Date(dateISO);
  const lastDate = streak.lastDayISO ? new Date(streak.lastDayISO) : null;
  if (!lastDate) {
    return { current: 1, best: Math.max(1, streak.best), lastDayISO: today.toISOString() };
  }
  const diff = Math.floor((today.getTime() - lastDate.getTime()) / dayInMs);
  if (diff === 0) {
    return streak;
  }
  if (diff === 1) {
    const current = streak.current + 1;
    return {
      current,
      best: Math.max(streak.best, current),
      lastDayISO: today.toISOString()
    };
  }
  return { current: 1, best: Math.max(streak.best, 1), lastDayISO: today.toISOString() };
};

export const formatStreakLabel = (streak: StreakState, singular: string, plural: string) => {
  const value = streak.current;
  const label = value === 1 ? singular : plural;
  return `${value} ${label}`;
};
