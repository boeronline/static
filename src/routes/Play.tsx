import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAppState } from '../state/AppStateProvider';
import { ArithmeticTest } from '../tests/Arithmetic';
import { MemoryDigitsTest } from '../tests/MemoryDigits';
import { ReactionTest } from '../tests/Reaction';
import { OddOneOutTest } from '../tests/OddOneOut';
import { getDifficultyConfig } from '../logic/difficulty';

export const PlayRoute: React.FC = () => {
  const { t } = useTranslation('tests');
  const { state, activeSession, startDailySession, completeCurrentTest, skipCurrentTest } = useAppState();
  const navigate = useNavigate();
  const config = getDifficultyConfig(state.settings.difficulty);

  useEffect(() => {
    if (!activeSession) {
      startDailySession();
    }
  }, [activeSession, startDailySession]);

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white/80 p-6 text-center shadow-md dark:bg-slate-800/80">
        <p className="text-lg font-semibold text-slate-700 dark:text-slate-100">{t('arithmetic.getReady')}</p>
        <button
          onClick={() => navigate('/')}
          className="focus-ring rounded-full bg-brand px-6 py-3 text-white font-semibold"
        >
          {t('complete')}
        </button>
      </div>
    );
  }

  const test = activeSession.tests[activeSession.currentIndex];
  if (!test) {
    return null;
  }

  const commonProps = {
    onComplete: (score: number, meta: Record<string, unknown>) => completeCurrentTest(score, meta),
    onSkip: skipCurrentTest
  } as const;

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-300">
            {t('complete')} {activeSession.currentIndex + 1}/{activeSession.tests.length}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {t(`${test.kind}.title` as const)}
          </h1>
        </div>
        <LanguageToggle />
      </header>
      {test.kind === 'arithmetic' && (
        <ArithmeticTest config={config.arithmetic} {...commonProps} />
      )}
      {test.kind === 'memory' && (
        <MemoryDigitsTest config={config.memory} {...commonProps} />
      )}
      {test.kind === 'reaction' && (
        <ReactionTest config={config.reaction} {...commonProps} />
      )}
      {test.kind === 'oddOneOut' && (
        <OddOneOutTest config={config.oddOneOut} {...commonProps} />
      )}
    </div>
  );
};
