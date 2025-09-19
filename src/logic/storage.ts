import { z } from 'zod';
import { ActiveSession, AppSettings, AppState, DifficultyLevel, Session, StreakState, TestKind } from '../types';

const STORAGE_KEY = 'brainSparks:v1';
const ACTIVE_SESSION_KEY = 'brainSparks:activeSession';
const LANGUAGE_KEY = 'brainSparks:lang';

const settingsSchema = z.object({
  lang: z.union([z.literal('en'), z.literal('nl')]).default('en'),
  dark: z.boolean().default(false),
  sound: z.boolean().default(true),
  vibration: z.boolean().default(true),
  difficulty: z.union([z.literal('easy'), z.literal('normal'), z.literal('hard')]).default('normal'),
  fontScale: z.union([z.literal('small'), z.literal('medium'), z.literal('large')]).default('medium'),
  theme: z.union([z.literal('system'), z.literal('light'), z.literal('dark')]).default('system')
});

const streakSchema = z.object({
  current: z.number(),
  best: z.number(),
  lastDayISO: z.string().nullable()
});

const testScoreSchema = z.object({
  kind: z.union([
    z.literal('arithmetic'),
    z.literal('memory'),
    z.literal('reaction'),
    z.literal('oddOneOut')
  ]),
  score: z.number(),
  meta: z.record(z.unknown()).optional()
});

const sessionSchema = z
  .object({
    id: z.string(),
    dateISO: z.string(),
    tests: z.array(testScoreSchema).optional(),
    totalScore: z.number(),
    brainAge: z.number()
  })
  .transform((session): Session => ({
    ...session,
    tests: session.tests ?? []
  }));

const activeSessionTestSchema = testScoreSchema.extend({
  status: z.union([z.literal('pending'), z.literal('complete')]).default('pending')
});

const activeSessionSchema = z
  .object({
    id: z.string(),
    dateISO: z.string(),
    tests: z.array(activeSessionTestSchema).default([]),
    currentIndex: z.number()
  })
  .transform(
    (session): ActiveSession => ({
      ...session,
      tests: session.tests.map((test) => ({
        ...test,
        meta: test.meta ?? undefined
      }))
    })
  );

const stateSchemaBase = z.object({
  sessions: z.array(sessionSchema).optional(),
  streak: streakSchema,
  settings: settingsSchema,
  badges: z.array(z.string()).optional(),
  version: z.literal(1)
});

const stateSchema = stateSchemaBase.transform((state): AppState => ({
  sessions: state.sessions ?? [],
  streak: state.streak,
  settings: state.settings,
  badges: state.badges ?? [],
  version: state.version
}));

export const defaultSettings: AppSettings = {
  lang: 'en',
  dark: false,
  sound: true,
  vibration: true,
  difficulty: 'normal',
  fontScale: 'medium',
  theme: 'system'
};

export const defaultState: AppState = {
  sessions: [],
  streak: { current: 0, best: 0, lastDayISO: null },
  settings: defaultSettings,
  badges: [],
  version: 1
};

const safeJSONParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn('Unable to parse stored data', error);
    return fallback;
  }
};

const getStorage = () => (typeof window === 'undefined' ? null : window.localStorage);

export const loadState = (): AppState => {
  const storage = getStorage();
  if (!storage) return { ...defaultState };
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return { ...defaultState, settings: { ...defaultSettings, lang: detectInitialLang() } };
  const parsed = safeJSONParse(raw, defaultState);
  const result = stateSchema.safeParse(parsed);
  if (!result.success) {
    console.warn('State validation failed, resetting to defaults', result.error);
    return { ...defaultState, settings: { ...defaultSettings, lang: detectInitialLang() } };
  }
  const lang = storage.getItem(LANGUAGE_KEY) as AppSettings['lang'] | null;
  return {
    ...result.data,
    settings: {
      ...defaultSettings,
      ...result.data.settings,
      lang: lang ?? result.data.settings.lang
    }
  };
};

const detectInitialLang = (): AppSettings['lang'] => {
  if (typeof window === 'undefined') return 'en';
  const nav = window.navigator.language.slice(0, 2).toLowerCase();
  return nav === 'nl' ? 'nl' : 'en';
};

export const saveState = (state: AppState) => {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  storage.setItem(LANGUAGE_KEY, state.settings.lang);
};

export const loadActiveSession = (): ActiveSession | null => {
  const storage = getStorage();
  if (!storage) return null;
  const raw = storage.getItem(ACTIVE_SESSION_KEY);
  if (!raw) return null;
  const parsed = safeJSONParse<unknown>(raw, null);
  if (!parsed) return null;
  const result = activeSessionSchema.safeParse(parsed);
  if (!result.success) {
    console.warn('Active session validation failed, discarding', result.error);
    return null;
  }
  return result.data;
};

export const saveActiveSession = (session: ActiveSession | null) => {
  const storage = getStorage();
  if (!storage) return;
  if (!session) {
    storage.removeItem(ACTIVE_SESSION_KEY);
    return;
  }
  storage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
};

export const exportData = (state: AppState) => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const timestamp = new Date().toISOString().split('T')[0];
  anchor.href = url;
  anchor.download = `brain-sparks-${timestamp}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

const stateImportSchema = stateSchema;

export const importData = (file: File): Promise<AppState> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = stateImportSchema.parse(parsed);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

export const clearStorage = () => {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
  storage.removeItem(ACTIVE_SESSION_KEY);
};

export const testKinds: TestKind[] = ['arithmetic', 'memory', 'reaction', 'oddOneOut'];

export const difficultyOrder: DifficultyLevel[] = ['easy', 'normal', 'hard'];

export const sortSessionsDescending = (sessions: Session[]) =>
  [...sessions].sort((a, b) => new Date(b.dateISO).getTime() - new Date(a.dateISO).getTime());

export const updateThemeClass = (settings: AppSettings) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const shouldDark =
    settings.theme === 'dark' || (settings.theme === 'system' && (settings.dark || prefersDark));
  root.dataset.theme = shouldDark ? 'dark' : 'light';
  root.classList.toggle('dark', shouldDark);
  const scale = settings.fontScale === 'large' ? 1.1 : settings.fontScale === 'small' ? 0.9 : 1;
  root.style.setProperty('--font-scale', scale.toString());
};
