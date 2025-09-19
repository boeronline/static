import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BadgeList } from '../components/BadgeList';
import { useAppState } from '../state/AppStateProvider';
import { formatStreakLabel } from '../logic/streaks';

export const HomeRoute: React.FC = () => {
  const { t, i18n } = useTranslation(['common']);
  const { state, activeSession, startDailySession } = useAppState();
  const today = new Date().toISOString().split('T')[0];
  const lastSession = [...state.sessions].sort(
    (a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime()
  )[0];
  const hasSessionToday = state.sessions.some((session) => session.dateISO.startsWith(today));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md dark:bg-slate-800/80">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{t('common:todaySession')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">{t('common:brainAgeDisclaimer')}</p>
          </div>
          <div className="rounded-2xl bg-brand/10 px-3 py-2 text-center text-sm font-semibold text-brand">
            {t('common:dailyStreak')}: {formatStreakLabel(state.streak, t('common:day'), t('common:days'))}
          </div>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <button
              onClick={startDailySession}
              className="focus-ring flex items-center justify-center rounded-2xl bg-brand px-6 py-4 text-lg font-semibold text-white shadow-md"
            >
              {activeSession
                ? t('common:resumeSession')
                : hasSessionToday
                ? t('common:playNow')
                : t('common:startSession')}
            </button>
            <div className="flex gap-3 text-sm">
              <Link
                to="/results"
                className="focus-ring flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center font-medium text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {t('common:viewProgress')}
              </Link>
              <Link
                to="/settings"
                className="focus-ring flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center font-medium text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {t('common:viewSettings')}
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100/70 p-4 text-sm text-slate-600 dark:bg-slate-900/60 dark:text-slate-200">
            {lastSession ? (
              <dl className="grid grid-cols-2 gap-3">
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-300">{t('results:dailyScore')}</dt>
                  <dd className="text-xl font-semibold text-slate-800 dark:text-slate-100">{lastSession.totalScore}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-300">{t('common:brainAge')}</dt>
                  <dd className="text-xl font-semibold text-slate-800 dark:text-slate-100">{lastSession.brainAge}</dd>
                </div>
                <div className="col-span-2 text-xs text-slate-500 dark:text-slate-300">
                  {new Intl.DateTimeFormat(i18n.language, {
                    dateStyle: 'medium'
                  }).format(new Date(lastSession.dateISO))}
                </div>
              </dl>
            ) : (
              <p>{t('common:noData')}</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white/90 p-5 shadow-md dark:bg-slate-800/80">
        <h2 className="mb-3 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('common:badges')}</h2>
        <BadgeList badges={state.badges} />
      </section>
    </div>
  );
};
