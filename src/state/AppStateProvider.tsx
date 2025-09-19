import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import {
  ActiveSession,
  ActiveSessionTest,
  AppSettings,
  AppState,
  Session,
  TestKind
} from '../types';
import {
  defaultState,
  exportData as exportState,
  importData,
  loadActiveSession,
  loadState,
  saveActiveSession,
  saveState,
  testKinds,
  updateThemeClass
} from '../logic/storage';
import { updateStreak } from '../logic/streaks';
import { calculateBrainAge } from '../logic/brainAge';
import { scoreFeedback } from '../logic/scoring';
import { useToast } from './ToastContext';
import i18n from '../i18n';

interface AppStateContextValue {
  state: AppState;
  activeSession: ActiveSession | null;
  startDailySession: () => ActiveSession;
  completeCurrentTest: (score: number, meta?: Record<string, unknown>) => void;
  skipCurrentTest: () => void;
  cancelSession: () => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setLanguage: (lang: AppSettings['lang']) => void;
  exportData: () => void;
  importFromFile: (file: File) => Promise<void>;
  resetAll: () => void;
  getFeedback: (kind: TestKind, score: number) => 'positive' | 'neutral' | 'negative';
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

const pickTests = (count = 3): ActiveSessionTest[] => {
  const shuffled = [...testKinds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((kind) => ({ kind, score: 0, status: 'pending' }));
};

const todayISO = () => new Date().toISOString().split('T')[0];

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(() => loadActiveSession());
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  useEffect(() => {
    updateThemeClass(state.settings);
  }, [state.settings]);

  useEffect(() => {
    if (i18n.language !== state.settings.lang) {
      i18n.changeLanguage(state.settings.lang).catch((error) => {
        console.error('Unable to switch language', error);
      });
    }
  }, [state.settings.lang, i18n]);

  const startDailySession = () => {
    const date = todayISO();
    if (activeSession && activeSession.dateISO.startsWith(date)) {
      return activeSession;
    }
    const tests = pickTests();
    const session: ActiveSession = {
      id: uuid(),
      dateISO: `${date}T00:00:00.000Z`,
      tests,
      currentIndex: 0
    };
    setActiveSession(session);
    navigate('/play');
    return session;
  };

  const finishSession = (session: ActiveSession) => {
    const completeTests = session.tests.filter((t) => t.status === 'complete');
    if (completeTests.length === 0) return;
    const date = session.dateISO;
    const scoreMap = completeTests.reduce<Record<TestKind, number>>((acc, test) => {
      acc[test.kind] = test.score;
      return acc;
    }, {} as Record<TestKind, number>);
    const brainAge = calculateBrainAge(scoreMap);
    const totalScore = completeTests.reduce((sum, test) => sum + test.score, 0);

    const completedScores: Session['tests'] = completeTests.map((test) => {
      const { status: _status, ...rest } = test;
      return rest;
    });

    const newSession: Session = {
      id: session.id,
      dateISO: date,
      tests: completedScores,
      totalScore,
      brainAge
    };

    let unlockedBadges: string[] = [];
    setState((prev) => {
      const updatedSessions = [...prev.sessions.filter((s) => s.id !== newSession.id), newSession];
      const newStreak = updateStreak(prev.streak, date);
      const nextBadges = deriveBadges(prev.badges, newSession, newStreak);
      unlockedBadges = nextBadges.filter((badge) => !prev.badges.includes(badge));
      const nextState: AppState = {
        ...prev,
        sessions: updatedSessions,
        streak: newStreak,
        badges: nextBadges
      };
      return nextState;
    });
    setActiveSession(null);
    toast.show('success', 'common:todayComplete');
    if (unlockedBadges.length > 0) {
      toast.show('success', 'common:badgeEarned');
    }
  };

  const completeCurrentTest = (score: number, meta?: Record<string, unknown>) => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const tests = prev.tests.map((test, index) => {
        if (index !== prev.currentIndex) {
          return test;
        }
        const mergedMeta = meta ? { ...(test.meta ?? {}), ...meta } : test.meta;
        const updatedTest: ActiveSessionTest = {
          ...test,
          status: 'complete',
          score,
          ...(mergedMeta !== undefined ? { meta: mergedMeta } : {})
        };
        return updatedTest;
      });
      const nextIndex = prev.currentIndex + 1;
      const nextSession: ActiveSession = {
        ...prev,
        tests,
        currentIndex: nextIndex
      };
      if (nextIndex >= tests.length) {
        finishSession({ ...nextSession });
        return null;
      }
      return nextSession;
    });
  };

  const skipCurrentTest = () => {
    setActiveSession((prev) => {
      if (!prev) return prev;
      const tests = prev.tests.map((test, index) => {
        if (index !== prev.currentIndex) {
          return test;
        }
        const updatedTest: ActiveSessionTest = {
          ...test,
          status: 'complete',
          score: 0
        };
        return updatedTest;
      });
      const nextIndex = prev.currentIndex + 1;
      const nextSession: ActiveSession = {
        ...prev,
        tests,
        currentIndex: nextIndex
      };
      if (nextIndex >= tests.length) {
        finishSession({ ...nextSession });
        return null;
      }
      return nextSession;
    });
  };

  const cancelSession = () => {
    setActiveSession(null);
  };

  const updateSettings = (settings: Partial<AppSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...settings
      }
    }));
  };

  const setLanguage = (lang: AppSettings['lang']) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, lang }
    }));
  };

  const exportData = () => {
    exportState(state);
    toast.show('success', 'common:exportSuccess');
  };

  const importFromFile = async (file: File) => {
    try {
      const imported = await importData(file);
      setState(imported);
      toast.show('success', 'common:importSuccess');
    } catch (error) {
      console.error(error);
      toast.show('error', 'common:importError');
    }
  };

  const resetAll = () => {
    setState((prev) => ({
      ...defaultState,
      settings: { ...defaultState.settings, lang: prev.settings.lang }
    }));
    setActiveSession(null);
  };

  const getFeedback = (kind: TestKind, score: number) => scoreFeedback(score, kind);

  const value = useMemo(
    () => ({
      state,
      activeSession,
      startDailySession,
      completeCurrentTest,
      skipCurrentTest,
      cancelSession,
      updateSettings,
      setLanguage,
      exportData,
      importFromFile,
      resetAll,
      getFeedback
    }),
    [state, activeSession]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

const badgeDefinitions: Record<string, (session: Session, streak: AppState['streak']) => boolean> = {
  'streak-3': (_session, streak) => streak.current >= 3,
  'streak-5': (_session, streak) => streak.current >= 5,
  'streak-10': (_session, streak) => streak.current >= 10,
  'reaction-quick': (session) => {
    const reaction = session.tests.find((test) => test.kind === 'reaction');
    if (!reaction) return false;
    const median = reaction.meta?.medianMs as number | undefined;
    return typeof median === 'number' && median < 250;
  },
  'arithmetic-ace': (session) => {
    const arithmetic = session.tests.find((test) => test.kind === 'arithmetic');
    return !!arithmetic && arithmetic.score >= 500;
  },
  'memory-marvel': (session) => {
    const memory = session.tests.find((test) => test.kind === 'memory');
    const longest = memory?.meta?.longest as number | undefined;
    return !!memory && (memory.score >= 400 || (longest ?? 0) >= 10);
  }
};

const deriveBadges = (existing: string[], session: Session, streak: AppState['streak']) => {
  const unlocked = Object.entries(badgeDefinitions)
    .filter(([key, predicate]) => predicate(session, streak))
    .map(([key]) => key);
  const merged = new Set([...existing, ...unlocked]);
  return Array.from(merged);
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
