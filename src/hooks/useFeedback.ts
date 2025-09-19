import { useCallback, useRef } from 'react';
import { useAppState } from '../state/AppStateProvider';

export const useFeedback = () => {
  const { state } = useAppState();
  const audioCtx = useRef<AudioContext | null>(null);

  const ensureContext = () => {
    if (typeof window === 'undefined') return null;
    if (!audioCtx.current) {
      try {
        audioCtx.current = new AudioContext();
      } catch (error) {
        console.warn('Unable to start audio context', error);
      }
    }
    return audioCtx.current;
  };

  const playTone = useCallback(
    (frequency: number, duration = 0.12) => {
      if (!state.settings.sound) return;
      const ctx = ensureContext();
      if (!ctx) return;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.1;
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    },
    [state.settings.sound]
  );

  const vibrate = useCallback(
    (pattern: number | number[]) => {
      if (!state.settings.vibration) return;
      if (typeof window === 'undefined') return;
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    },
    [state.settings.vibration]
  );

  return {
    playSuccess: () => playTone(740),
    playTap: () => playTone(520, 0.08),
    vibrate
  };
};
