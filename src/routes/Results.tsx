import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartPanel } from '../components/ChartPanel';
import { BadgeList } from '../components/BadgeList';
import { useAppState } from '../state/AppStateProvider';
import { sortSessionsDescending } from '../logic/storage';

export const ResultsRoute: React.FC = () => {
  const { t, i18n } = useTranslation(['results', 'common']);
  const { state } = useAppState();
  const sessions = useMemo(() => sortSessionsDescending(state.sessions), [state.sessions]);
  const labels = sessions.map((session) =>
    new Intl.DateTimeFormat(i18n.language, { month: 'short', day: 'numeric' }).format(new Date(session.dateISO))
  );
  const scores = sessions.map((session) => session.totalScore);

  const testSeries = (kind: string) =>
    sessions.map((session) => session.tests.find((test) => test.kind === kind)?.score ?? 0);

  const summary = useMemo(() => {
    if (sessions.length === 0) return null;
    const brainAges = sessions.map((session) => session.brainAge);
    return {
      count: sessions.length,
      best: Math.min(...brainAges),
      average: Math.round(brainAges.reduce((sum, age) => sum + age, 0) / brainAges.length)
    };
  }, [sessions]);

  if (sessions.length === 0) {
    return <p className="rounded-3xl bg-white/90 p-6 text-center text-sm text-slate-600 shadow-md dark:bg-slate-800/80 dark:text-slate-200">{t('results:noSessions')}</p>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <ChartPanel
          title={t('results:dailyScore')}
          labels={labels}
          datasets={[
            {
              label: t('results:dailyScore'),
              data: scores,
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99,102,241,0.18)'
            }
          ]}
        />
        <ChartPanel
          title={t('results:testScores')}
          labels={labels}
          datasets={[
            {
              label: t('tests:arithmetic.title'),
              data: testSeries('arithmetic'),
              borderColor: '#f97316',
              backgroundColor: 'rgba(249,115,22,0.12)'
            },
            {
              label: t('tests:memory.title'),
              data: testSeries('memory'),
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20,184,166,0.12)'
            },
            {
              label: t('tests:reaction.title'),
              data: testSeries('reaction'),
              borderColor: '#6366f1',
              backgroundColor: 'rgba(99,102,241,0.12)'
            },
            {
              label: t('tests:oddOneOut.title'),
              data: testSeries('oddOneOut'),
              borderColor: '#facc15',
              backgroundColor: 'rgba(250,204,21,0.12)'
            }
          ]}
        />
      </section>

      {summary && (
        <section className="rounded-3xl bg-white/90 p-5 shadow-md dark:bg-slate-800/80">
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('results:title')}</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-200">
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-300">{t('results:sessionCount')}</dt>
              <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{summary.count}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-300">{t('results:bestBrainAge')}</dt>
              <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{summary.best}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-300">{t('results:averageBrainAge')}</dt>
              <dd className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{summary.average}</dd>
            </div>
          </dl>
        </section>
      )}

      <section className="rounded-3xl bg-white/90 p-5 shadow-md dark:bg-slate-800/80">
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{t('common:badges')}</h2>
        <BadgeList badges={state.badges} />
      </section>
    </div>
  );
};
