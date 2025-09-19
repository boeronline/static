import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScoreHUD } from '../components/ScoreHUD';
import { TestCard } from '../components/TestCard';
import { Timer } from '../components/Timer';
import { useFeedback } from '../hooks/useFeedback';
import { scoreOddOneOut } from '../logic/scoring';
import { DifficultyConfig } from '../types';

interface OddOneOutProps {
  config: DifficultyConfig['oddOneOut'];
  onComplete: (score: number, meta: Record<string, unknown>) => void;
  onSkip: () => void;
}

interface Puzzle {
  items: string[];
  oddIndex: number;
}

const puzzles: Puzzle[] = [
  { items: ['🔺', '🔺', '🔷', '🔺'], oddIndex: 2 },
  { items: ['🟥', '🟥', '🟩', '🟥'], oddIndex: 2 },
  { items: ['⚫️', '⚪️', '⚫️', '⚫️'], oddIndex: 1 },
  { items: ['▲', '▼', '▲', '▲'], oddIndex: 1 },
  { items: ['✳️', '✳️', '✴️', '✳️'], oddIndex: 2 },
  { items: ['🔶', '🔷', '🔶', '🔶'], oddIndex: 1 },
  { items: ['🟦', '🟦', '🟧', '🟦'], oddIndex: 2 },
  { items: ['⬛️', '⬛️', '⬛️', '⬜️'], oddIndex: 3 },
  { items: ['⭐️', '⭐️', '🌙', '⭐️'], oddIndex: 2 },
  { items: ['🜂', '🜂', '🜁', '🜂'], oddIndex: 2 }
];

export const OddOneOutTest: React.FC<OddOneOutProps> = ({ config, onComplete, onSkip }) => {
  const { t } = useTranslation('tests');
  const sequence = useMemo(() => [...puzzles].sort(() => Math.random() - 0.5).slice(0, 10), []);
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [correct, setCorrect] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [started, setStarted] = useState(false);
  const feedback = useFeedback();

  const finish = () => {
    const score = scoreOddOneOut(correct, mistakes, timeLeft);
    onComplete(score, { correct, mistakes, timeLeft, total: sequence.length });
  };

  const handleChoice = (choice: number) => {
    if (!started) return;
    const puzzle = sequence[index];
    if (!puzzle) return;
    if (choice === puzzle.oddIndex) {
      setCorrect((value) => value + 1);
      feedback.playSuccess();
      feedback.vibrate(20);
    } else {
      setMistakes((value) => value + 1);
      feedback.vibrate([20, 40, 20]);
    }
    if (index + 1 >= sequence.length) {
      finish();
    } else {
      setIndex((value) => value + 1);
    }
  };

  const start = () => {
    setStarted(true);
  };

  return (
    <TestCard title={t('oddOneOut.title')} description={t('oddOneOut.description')}>
      <ScoreHUD
        items={[
          { label: t('oddOneOut.score'), value: correct * 12 - mistakes * 6 },
          { label: t('oddOneOut.itemsLeft', { count: sequence.length - index }), value: sequence.length - index },
          { label: t('oddOneOut.timeLeft'), value: `${timeLeft}s` }
        ]}
      />
      <div className="flex flex-col items-center gap-4">
        {!started ? (
          <button onClick={start} className="focus-ring rounded-full bg-brand px-6 py-3 text-lg font-semibold text-white">
            {t('arithmetic.tapToStart')}
          </button>
        ) : (
          <>
            <Timer seconds={config.duration} running={started} onTick={setTimeLeft} onComplete={finish} />
            <div className="grid grid-cols-2 gap-3">
              {sequence[index]?.items.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoice(idx)}
                  className="focus-ring flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm transition hover:-translate-y-1 dark:bg-slate-700"
                >
                  {item}
                </button>
              ))}
            </div>
          </>
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
