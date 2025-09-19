import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '../components/LanguageToggle';
import { useAppState } from '../state/AppStateProvider';
import { useToast } from '../state/ToastContext';

export const SettingsRoute: React.FC = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { state, updateSettings, exportData, importFromFile, resetAll } = useAppState();
  const toast = useToast();

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await importFromFile(file);
    event.target.value = '';
  };

  const confirmReset = () => {
    if (window.confirm(t('settings:resetConfirm'))) {
      resetAll();
      toast.show('info', 'common:feedbackNeutral');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white/90 p-5 shadow-md dark:bg-slate-800/80">
        <header className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t('settings:title')}</h1>
          <LanguageToggle />
        </header>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings:interface')}</h2>
            <div className="mt-2 grid gap-3">
              <label className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-slate-900/60">
                <span>{t('common:darkMode')}</span>
                <input
                  type="checkbox"
                  checked={state.settings.theme === 'dark' || state.settings.dark}
                  onChange={(event) =>
                    updateSettings({
                      dark: event.target.checked,
                      theme: event.target.checked ? 'dark' : 'light'
                    })
                  }
                  className="h-5 w-5"
                />
              </label>
              <label className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-slate-900/60">
                <span>{t('settings:fontSize')}</span>
                <select
                  value={state.settings.fontScale}
                  onChange={(event) => updateSettings({ fontScale: event.target.value as typeof state.settings.fontScale })}
                  className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="small">{t('settings:fontSmall')}</option>
                  <option value="medium">{t('settings:fontMedium')}</option>
                  <option value="large">{t('settings:fontLarge')}</option>
                </select>
              </label>
              <label className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-slate-900/60">
                <span>{t('common:difficulty')}</span>
                <select
                  value={state.settings.difficulty}
                  onChange={(event) => updateSettings({ difficulty: event.target.value as typeof state.settings.difficulty })}
                  className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-1 dark:border-slate-700 dark:bg-slate-900"
                >
                  <option value="easy">{t('common:easy')}</option>
                  <option value="normal">{t('common:normal')}</option>
                  <option value="hard">{t('common:hard')}</option>
                </select>
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-300">{t('settings:difficultyHint')}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings:feedback')}</h2>
            <div className="mt-2 grid gap-3">
              <label className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-slate-900/60">
                <span>{t('common:sound')}</span>
                <input
                  type="checkbox"
                  checked={state.settings.sound}
                  onChange={(event) => updateSettings({ sound: event.target.checked })}
                  className="h-5 w-5"
                />
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-300">{t('settings:soundHint')}</p>
              <label className="flex items-center justify-between rounded-2xl bg-slate-100/70 px-4 py-3 dark:bg-slate-900/60">
                <span>{t('common:vibration')}</span>
                <input
                  type="checkbox"
                  checked={state.settings.vibration}
                  onChange={(event) => updateSettings({ vibration: event.target.checked })}
                  className="h-5 w-5"
                />
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-300">{t('settings:vibrationHint')}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{t('settings:backup')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-300">{t('settings:exportDescription')}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={exportData} className="focus-ring rounded-full bg-brand px-4 py-2 text-white font-semibold">
                {t('common:exportData')}
              </button>
              <label className="focus-ring inline-flex cursor-pointer items-center gap-2 rounded-full bg-slate-200 px-4 py-2 font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-100">
                {t('common:importData')}
                <input type="file" accept="application/json" className="hidden" onChange={handleFile} />
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{t('settings:importDescription')}</p>
            <button
              onClick={confirmReset}
              className="focus-ring mt-4 rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-50 dark:border-rose-500/50 dark:text-rose-300"
            >
              {t('settings:reset')}
            </button>
          </div>
        </div>
      </section>
      <p className="text-xs text-slate-500 dark:text-slate-300">{t('common:privacyNote')}</p>
    </div>
  );
};
