import { useTranslation } from 'react-i18next';
import { supportedLanguages } from '../i18n';
import { useAppState } from '../state/AppStateProvider';

export const LanguageToggle: React.FC = () => {
  const { i18n, t } = useTranslation('common');
  const { state, setLanguage } = useAppState();

  const change = (lang: (typeof supportedLanguages)[number]) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <div className="inline-flex rounded-full bg-slate-200/70 dark:bg-slate-800/70 p-1" role="group" aria-label={t('language')}>
      {supportedLanguages.map((lang) => (
        <button
          key={lang}
          onClick={() => change(lang)}
          className={`px-3 py-1 text-sm font-medium rounded-full focus-ring transition ${
            state.settings.lang === lang ? 'bg-white text-slate-900 shadow dark:bg-slate-100' : 'text-slate-600 dark:text-slate-300'
          }`}
          type="button"
        >
          {lang === 'en' ? t('english') : t('dutch')}
        </button>
      ))}
    </div>
  );
};
