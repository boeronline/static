import { useEffect, useRef, useState } from 'react';

interface TimerProps {
  seconds: number;
  running: boolean;
  onComplete?: () => void;
  onTick?: (remaining: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ seconds, running, onComplete, onTick }) => {
  const [remaining, setRemaining] = useState(seconds);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 1);
        onTick?.(next);
        if (next === 0) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          onComplete?.();
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, onComplete, onTick]);

  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="font-mono text-2xl text-brand">{minutes}:{secs}</div>
  );
};
