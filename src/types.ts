export type TestKind = 'arithmetic' | 'memory' | 'reaction' | 'oddOneOut';

export interface TestScore {
  kind: TestKind;
  score: number;
  meta?: Record<string, unknown>;
}

export interface Session {
  id: string;
  dateISO: string;
  tests: TestScore[];
  totalScore: number;
  brainAge: number;
}

export type DifficultyLevel = 'easy' | 'normal' | 'hard';

export interface AppSettings {
  lang: 'en' | 'nl';
  dark: boolean;
  sound: boolean;
  vibration: boolean;
  difficulty: DifficultyLevel;
  fontScale: 'small' | 'medium' | 'large';
  theme: 'system' | 'light' | 'dark';
}

export interface StreakState {
  current: number;
  best: number;
  lastDayISO: string | null;
}

export interface AppState {
  sessions: Session[];
  streak: StreakState;
  settings: AppSettings;
  badges: string[];
  version: 1;
}

export interface ActiveSessionTest extends TestScore {
  status: 'pending' | 'complete';
}

export interface ActiveSession {
  id: string;
  dateISO: string;
  tests: ActiveSessionTest[];
  currentIndex: number;
}

export interface DifficultyConfig {
  arithmetic: {
    duration: number;
    range: [number, number];
    operations: ('+' | '-' | '*' | '/')[];
  };
  memory: {
    revealMs: number;
    startLength: number;
  };
  reaction: {
    trials: number;
    minDelay: number;
    maxDelay: number;
  };
  oddOneOut: {
    duration: number;
  };
}
