import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TestCard } from '../components/TestCard';
import { useFeedback } from '../hooks/useFeedback';
import { scoreReaction } from '../logic/scoring';
import { DifficultyConfig } from '../types';

interface ReactionProps {
  config: DifficultyConfig['reaction'];
  onComplete: (score: number, meta: Record<string, unknown>) => void;
  onSkip: () => void;
}

type Status = 'idle' | 'waiting' | 'ready' | 'finished';

const median = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return Math.round(sorted[mid]);
};

export const ReactionTest: React.FC<ReactionProps> = ({ config, onComplete, onSkip }) => {
  const { t } = useTranslation('tests');
  const [status, setStatus] = useState<Status>('idle');
  const [trial, setTrial] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const timeoutRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const feedback = useFeedback();

  const begin = () => {
    setStatus('waiting');
    setTrial(1);
  };

  const schedule = useCallback(() => {
    const delay = Math.random() * (config.maxDelay - config.minDelay) + config.minDelay;
    timeoutRef.current = window.setTimeout(() => {
      setStatus('ready');
      startRef.current = performance.now();
    }, delay);
  }, [config.maxDelay, config.minDelay]);

  useEffect(() => {
    if (status === 'waiting') {
      schedule();
    }
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
    };
  }, [status, schedule]);

  const tap = () => {
    if (status === 'idle') {
      feedback.playTap();
      begin();
      return;
    }
    if (status === 'waiting') {
      feedback.vibrate([20, 40, 20]);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      setTimes((prev) => {
        const next = [...prev, config.maxDelay];
        return next.slice(-config.trials);
      });
      schedule();
      return;
    }
    if (status === 'ready') {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      const duration = performance.now() - startRef.current;
      feedback.playSuccess();
      feedback.vibrate(20);
      const nextTimes = [...times, duration].slice(-config.trials);
      setTimes(nextTimes);
      if (trial >= config.trials) {
        const med = median(nextTimes);
        const score = scoreReaction(med);
        setStatus('finished');
        onComplete(score, { medianMs: med, values: nextTimes });
      } else {
        setTrial((value) => value + 1);
        setStatus('waiting');
      }
    }
  };

  return (
    <TestCard title={t('reaction.title')} description={t('reaction.description')}>
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm font-semibold text-slate-500 dark:text-slate-300">
          {status === 'waiting'
            ? t('reaction.wait')
            : status === 'ready'
            ? t('reaction.go')
            : status === 'finished'
            ? t('complete')
            : t('arithmetic.tapToStart')}
        </div>
        <button
          onClick={tap}
          className={`focus-ring h-48 w-48 rounded-full text-xl font-semibold text-white shadow-lg transition ${
            status === 'ready' ? 'bg-emerald-500 animate-pulse' : 'bg-brand'
          }`}
        >
          {status === 'ready' ? t('reaction.go') : t('reaction.trial', { count: Math.max(trial, 1) })}
        </button>
        {times.length > 0 && (
          <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-700 dark:text-slate-100">
            {t('reaction.median')}: {median(times)} ms
          </div>
        )}
      </div>
      <div className="mt-3 text-right text-sm text-slate-500 dark:text-slate-300">
        <button onClick={onSkip} className="focus-ring rounded-full px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700">
          {t('skip')}
        </button>
      </div>
    </TestCard>
  );
};
