// Learning progress persistence (localStorage) for the Learning Studio.

import { lessons } from '@/data/lessons';

const STORAGE_KEY = 'signlang-progress-v1';
const LEGACY_KEY = 'signar-progress-v1'; // pre-rename key, migrated on first load

export interface LessonResult {
  score: number;        // 0..1
  completedAt: string;  // ISO date-time
  attempts: number;
  bestScore: number;    // 0..1
}

export interface Progress {
  xp: number;
  streak: number;              // consecutive practice days
  lastPracticeDate: string;    // YYYY-MM-DD of most recent practice
  completedLessons: Record<string, LessonResult>;
  /** YYYY-MM-DD dates on which a perfect (100%) quiz was scored. */
  perfectDates: string[];
}

const emptyProgress: Progress = {
  xp: 0,
  streak: 0,
  lastPracticeDate: '',
  completedLessons: {},
  perfectDates: [],
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function loadProgress(): Progress {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(LEGACY_KEY);
      if (raw) {
        localStorage.setItem(STORAGE_KEY, raw);
        localStorage.removeItem(LEGACY_KEY);
      }
    }
    if (!raw) return { ...emptyProgress };
    const parsed = JSON.parse(raw);
    return { ...emptyProgress, ...parsed };
  } catch {
    return { ...emptyProgress };
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

/** Update the day streak for a practice session happening now. */
function touchStreak(p: Progress): Progress {
  const today = todayStr();
  if (p.lastPracticeDate === today) return p; // already counted today

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const streak = p.lastPracticeDate === yesterday ? p.streak + 1 : 1;
  return { ...p, streak, lastPracticeDate: today };
}

/**
 * Record a finished quiz. Returns the updated (already saved) progress
 * and the XP earned, so the UI can show a summary.
 */
export function recordLessonResult(
  lessonId: string,
  score: number,
  xpEarned: number,
  passed: boolean,
): { progress: Progress; xpEarned: number } {
  let p = touchStreak(loadProgress());

  p = { ...p, xp: p.xp + xpEarned };

  if (score >= 1 && !p.perfectDates.includes(todayStr())) {
    p = { ...p, perfectDates: [...p.perfectDates, todayStr()] };
  }

  if (passed) {
    const prev = p.completedLessons[lessonId];
    p = {
      ...p,
      completedLessons: {
        ...p.completedLessons,
        [lessonId]: {
          score,
          completedAt: new Date().toISOString(),
          attempts: (prev?.attempts ?? 0) + 1,
          bestScore: Math.max(prev?.bestScore ?? 0, score),
        },
      },
    };
  } else if (p.completedLessons[lessonId]) {
    // failed retake of a completed lesson: keep completion, count the attempt
    const prev = p.completedLessons[lessonId];
    p = {
      ...p,
      completedLessons: {
        ...p.completedLessons,
        [lessonId]: { ...prev, attempts: prev.attempts + 1 },
      },
    };
  }

  saveProgress(p);
  return { progress: p, xpEarned };
}

/** A lesson unlocks when the previous lesson in the list is completed. */
export function isLessonUnlocked(lessonId: string, p: Progress): boolean {
  const idx = lessons.findIndex(l => l.id === lessonId);
  if (idx <= 0) return true;
  return !!p.completedLessons[lessons[idx - 1].id];
}

// ---- Daily challenges (derived from stored progress, not stored themselves) ----

export interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  completed: boolean;
}

export function getChallenges(p: Progress): Challenge[] {
  const today = todayStr();
  return [
    {
      id: 'daily-practice',
      title: 'Daily Practice',
      description: 'Finish any lesson quiz today',
      reward: '+streak',
      completed: p.lastPracticeDate === today,
    },
    {
      id: 'perfect-score',
      title: 'Perfect Score',
      description: 'Get 100% on a quiz today',
      reward: '+25 XP bonus',
      completed: p.perfectDates.includes(today),
    },
    {
      id: 'streak-week',
      title: 'Weekly Streak',
      description: 'Practice 7 days in a row',
      reward: 'Rising Star badge',
      completed: p.streak >= 7,
    },
  ];
}

/** Reset all learning progress (used by settings / debugging). */
export function resetProgress(): Progress {
  saveProgress({ ...emptyProgress });
  return { ...emptyProgress };
}
