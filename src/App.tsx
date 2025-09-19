import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from './components/LanguageToggle';
import { HomeRoute } from './routes/Home';
import { PlayRoute } from './routes/Play';
import { ResultsRoute } from './routes/Results';
import { SettingsRoute } from './routes/Settings';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition focus-ring ${
    isActive
      ? 'bg-brand text-white shadow'
      : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-200 dark:hover:bg-slate-700/60'
  }`;

const App = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200 pb-16 text-[calc(1rem*var(--font-scale,1))] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-6">
        <header className="flex flex-col gap-4 rounded-3xl bg-white/80 px-5 py-4 shadow-md backdrop-blur dark:bg-slate-800/70 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{t('appTitle')}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-300">{t('brainAgeDisclaimer')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            <nav className="flex gap-2 rounded-full bg-slate-100/80 p-1 dark:bg-slate-700/70">
              <NavLink to="/" className={navLinkClass} end>
                {t('home')}
              </NavLink>
              <NavLink to="/play" className={navLinkClass}>
                {t('play')}
              </NavLink>
              <NavLink to="/results" className={navLinkClass}>
                {t('results')}
              </NavLink>
              <NavLink to="/settings" className={navLinkClass}>
                {t('settings')}
              </NavLink>
            </nav>
          </div>
        </header>

        <main className="mt-6 flex-1">
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/play" element={<PlayRoute />} />
            <Route path="/results" element={<ResultsRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} Brain Sparks</span>
        </footer>
      </div>
    </div>
  );
};

export default App;
