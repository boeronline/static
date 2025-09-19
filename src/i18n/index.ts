import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './en/common.json';
import enTests from './en/tests.json';
import enResults from './en/results.json';
import enSettings from './en/settings.json';
import nlCommon from './nl/common.json';
import nlTests from './nl/tests.json';
import nlResults from './nl/results.json';
import nlSettings from './nl/settings.json';

export const supportedLanguages = ['en', 'nl'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

const resources = {
  en: {
    common: enCommon,
    tests: enTests,
    results: enResults,
    settings: enSettings
  },
  nl: {
    common: nlCommon,
    tests: nlTests,
    results: nlResults,
    settings: nlSettings
  }
} as const;

const storageKey = 'brainSparks:lang';
const detectLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return 'en';
  }
  const stored = window.localStorage.getItem(storageKey) as SupportedLanguage | null;
  if (stored && supportedLanguages.includes(stored)) {
    return stored;
  }
  const nav = window.navigator.language.slice(0, 2).toLowerCase();
  return supportedLanguages.includes(nav as SupportedLanguage) ? (nav as SupportedLanguage) : 'en';
};

const initialLanguage = detectLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'tests', 'results', 'settings'],
    interpolation: {
      escapeValue: false
    }
  });

if (typeof window !== 'undefined') {
  window.localStorage.setItem(storageKey, initialLanguage);
  document.documentElement.lang = initialLanguage;
  i18n.on('languageChanged', (lng) => {
    window.localStorage.setItem(storageKey, lng);
    document.documentElement.lang = lng;
  });
}

export default i18n;
