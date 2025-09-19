import { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TestCard } from '../components/TestCard';
import { useFeedback } from '../hooks/useFeedback';
import { scoreMemory } from '../logic/scoring';
import { DifficultyConfig } from '../types';

interface MemoryProps {
  config: DifficultyConfig['memory'];
  onComplete: (score: number, meta: Record<string, unknown>) => void;
  onSkip: () => void;
}

type Phase = 'idle' | 'showing' | 'input';

const ROUNDS = 5;

const generateSequence = (length: number) => {
  let digits = '';
  for (let i = 0; i < length; i += 1) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
};

export const MemoryDigitsTest: React.FC<MemoryProps> = ({ config, onComplete, onSkip }) => {
  const { t } = useTranslation('tests');
  const [phase, setPhase] = useState<Phase>('idle');
  const [round, setRound] = useState(0);
  const [sequence, setSequence] = useState('');
  const [input, setInput] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [longest, setLongest] = useState(0);
  const feedback = useFeedback();

  useEffect(() => {
    if (phase === 'showing') {
      const timeout = window.setTimeout(() => {
        setPhase('input');
      }, config.revealMs);
      return () => window.clearTimeout(timeout);
    }
  }, [phase, config.revealMs]);

  const startRound = () => {
    const length = config.startLength + round;
    const newSequence = generateSequence(length);
    setSequence(newSequence);
    setInput('');
    setPhase('showing');
  };

  const startTest = () => {
    setRound(0);
    setCorrectCount(0);
    setLongest(0);
    setPhase('idle');
    setTimeout(() => {
      setRound(1);
    }, 200);
  };

  useEffect(() => {
    if (round > 0 && phase === 'idle') {
      startRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (phase !== 'input') return;
    const isCorrect = input.trim() === sequence;
    if (isCorrect) {
      setCorrectCount((value) => value + 1);
      setLongest((value) => Math.max(value, sequence.length));
      feedback.playSuccess();
      feedback.vibrate(30);
    } else {
      feedback.vibrate([20, 40, 20]);
    }
    if (round >= ROUNDS) {
      const accuracy = (isCorrect ? 1 : 0) + correctCount;
      const score = scoreMemory(Math.max(longest, sequence.length), accuracy / ROUNDS);
      onComplete(score, {
        accuracy: accuracy / ROUNDS,
        longest: Math.max(longest, isCorrect ? sequence.length : longest)
      });
      return;
    }
    setRound((value) => value + 1);
    setPhase('idle');
  };

  return (
    <TestCard title={t('memory.title')} description={t('memory.description')}>
      {phase === 'idle' && round === 0 && (
        <button
          onClick={startTest}
          type="button"
          className="focus-ring mx-auto rounded-full bg-brand px-6 py-3 text-white text-lg font-semibold"
        >
          {t('arithmetic.tapToStart')}
        </button>
      )}
      {phase !== 'idle' && (
        <div className="flex flex-col items-center gap-4">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {phase === 'showing' ? t('memory.showing') : t('memory.typeHere')}
          </div>
          <div className="min-h-[3rem] rounded-2xl bg-slate-100 px-6 py-3 text-center text-3xl font-mono tracking-widest text-slate-800 dark:bg-slate-700 dark:text-slate-100">
            {phase === 'showing' ? sequence : '•'.repeat(sequence.length)}
          </div>
          {phase === 'input' && (
            <form onSubmit={submit} className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                autoFocus
                className="focus-ring w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900"
              />
              <button type="submit" className="focus-ring rounded-xl bg-brand px-4 py-2 text-white font-semibold">
                OK
              </button>
            </form>
          )}
          <div className="text-sm text-slate-500 dark:text-slate-300">
            {t('memory.streak')}: {round}/{ROUNDS}
          </div>
        </div>
      )}
      <div className="mt-3 text-right text-sm text-slate-500 dark:text-slate-300">
        <button onClick={onSkip} className="focus-ring rounded-full px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700">
          {t('skip')}
        </button>
      </div>
    </TestCard>
  );
};
