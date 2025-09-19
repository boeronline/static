import { FormEvent, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScoreHUD } from '../components/ScoreHUD';
import { TestCard } from '../components/TestCard';
import { Timer } from '../components/Timer';
import { useFeedback } from '../hooks/useFeedback';
import { scoreArithmetic } from '../logic/scoring';
import { DifficultyConfig } from '../types';

interface ArithmeticProps {
  config: DifficultyConfig['arithmetic'];
  onComplete: (score: number, meta: Record<string, unknown>) => void;
  onSkip: () => void;
}

interface Question {
  a: number;
  b: number;
  op: string;
  answer: number;
}

const useQuestion = (config: DifficultyConfig['arithmetic']) => {
  return useMemo(() => () => {
    const operations = config.operations;
    const op = operations[Math.floor(Math.random() * operations.length)];
    const [min, max] = config.range;
    let a = Math.floor(Math.random() * (max - min + 1)) + min;
    let b = Math.floor(Math.random() * (max - min + 1)) + min;
    if (op === '-') {
      if (b > a) [a, b] = [b, a];
    }
    if (op === '/') {
      b = Math.max(1, b);
      const result = Math.floor(Math.random() * (max - min + 1)) + min;
      a = result * b;
      return { a, b, op, answer: result };
    }
    if (op === '*') {
      return { a, b, op, answer: a * b };
    }
    if (op === '+') {
      return { a, b, op, answer: a + b };
    }
    return { a, b, op, answer: a - b };
  }, [config]);
};

export const ArithmeticTest: React.FC<ArithmeticProps> = ({ config, onComplete, onSkip }) => {
  const { t } = useTranslation('tests');
  const generate = useQuestion(config);
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const feedback = useFeedback();

  const begin = () => {
    if (started) return;
    feedback.playTap();
    setQuestion(generate());
    setStarted(true);
  };

  const finish = () => {
    const score = scoreArithmetic(correct, mistakes, timeLeft);
    onComplete(score, { correct, mistakes, duration: config.duration, timeLeft });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!question) return;
    const answer = Number(input.trim());
    if (Number.isNaN(answer)) return;
    if (answer === question.answer) {
      setCorrect((value) => value + 1);
      feedback.playSuccess();
      feedback.vibrate(20);
    } else {
      setMistakes((value) => value + 1);
      feedback.vibrate([10, 40, 10]);
    }
    setInput('');
    setQuestion(generate());
  };

  return (
    <TestCard title={t('arithmetic.title')} description={t('arithmetic.description')}>
      <ScoreHUD
        items={[
          { label: t('arithmetic.correct'), value: correct },
          { label: t('arithmetic.mistakes'), value: mistakes },
          { label: t('arithmetic.timeLeft'), value: `${timeLeft}s` }
        ]}
      />
      <div className="flex flex-col items-center gap-4">
        {!started && (
          <button
            onClick={begin}
            className="focus-ring rounded-full bg-brand px-6 py-3 text-white text-lg font-semibold"
            type="button"
          >
            {t('arithmetic.tapToStart')}
          </button>
        )}
        {started && question && (
          <div className="flex flex-col items-center gap-3">
            <Timer seconds={config.duration} running={started} onTick={setTimeLeft} onComplete={finish} />
            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {question.a} {question.op} {question.b} = ?
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                autoFocus
                inputMode="numeric"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                className="focus-ring w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900"
                placeholder={t('arithmetic.placeholder')}
              />
              <button type="submit" className="focus-ring rounded-xl bg-brand px-4 py-2 text-white font-semibold">
                OK
              </button>
            </form>
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-between text-sm text-slate-500 dark:text-slate-300">
        <button onClick={onSkip} className="focus-ring rounded-full px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700">
          {t('skip')}
        </button>
        {started ? (
          <span>{started ? '' : t('arithmetic.getReady')}</span>
        ) : (
          <span>{t('arithmetic.getReady')}</span>
        )}
      </div>
    </TestCard>
  );
};
