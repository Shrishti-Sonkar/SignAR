// Lesson definitions for the Learning Studio.
// Every sign listed here MUST exist as a key in signDictionary so the
// lesson player can always show a real video.

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  /** Lowercase signDictionary keys, in teaching order. */
  signs: string[];
}

export const LESSON_PASS_SCORE = 0.7;   // ≥70% on the quiz to complete
export const XP_PER_CORRECT = 10;
export const XP_LESSON_BONUS = 50;
export const XP_PERFECT_BONUS = 25;

export const lessons: Lesson[] = [
  {
    id: 'greetings',
    title: 'Basic Greetings',
    description: 'Say hello, welcome people, and thank them',
    difficulty: 'Beginner',
    signs: ['hello', 'welcome', 'bye', 'thank you', 'good'],
  },
  {
    id: 'numbers',
    title: 'Numbers 0–9',
    description: 'Sign the digits from zero to nine',
    difficulty: 'Beginner',
    signs: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  },
  {
    id: 'alphabet-1',
    title: 'Alphabet A–I',
    description: 'The first nine letters — the base of fingerspelling',
    difficulty: 'Beginner',
    signs: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
  },
  {
    id: 'alphabet-2',
    title: 'Alphabet J–R',
    description: 'Continue fingerspelling with the middle letters',
    difficulty: 'Beginner',
    signs: ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r'],
  },
  {
    id: 'alphabet-3',
    title: 'Alphabet S–Z',
    description: 'Finish the fingerspelling alphabet',
    difficulty: 'Beginner',
    signs: ['s', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
  },
  {
    id: 'pronouns',
    title: 'People & Pronouns',
    description: 'Talk about yourself and others',
    difficulty: 'Beginner',
    signs: ['i', 'you', 'we', 'they', 'me', 'my', 'your', 'us'],
  },
  {
    id: 'questions',
    title: 'Question Words',
    description: 'Ask what, where, when, why, who, and how',
    difficulty: 'Intermediate',
    signs: ['what', 'where', 'when', 'why', 'who', 'how', 'which', 'whose'],
  },
  {
    id: 'feelings',
    title: 'Feelings & Qualities',
    description: 'Express emotions and describe things',
    difficulty: 'Intermediate',
    signs: ['happy', 'sad', 'beautiful', 'laugh', 'good', 'great', 'right', 'wrong'],
  },
  {
    id: 'daily-life',
    title: 'Daily Activities',
    description: 'Eat, work, study, and everyday verbs',
    difficulty: 'Intermediate',
    signs: ['eat', 'walk', 'wash', 'work', 'study', 'learn', 'talk', 'see'],
  },
  {
    id: 'time-place',
    title: 'Time & Place',
    description: 'When and where things happen',
    difficulty: 'Intermediate',
    signs: ['time', 'day', 'now', 'here', 'home', 'before', 'after', 'world'],
  },
  {
    id: 'connectors',
    title: 'Connecting Words',
    description: 'The glue words that build full sentences',
    difficulty: 'Advanced',
    signs: ['and', 'but', 'also', 'with', 'without', 'not', 'can', 'cannot'],
  },
  {
    id: 'conversation',
    title: 'Everyday Conversation',
    description: 'Put it together: help, ask, come, go and more',
    difficulty: 'Advanced',
    signs: ['help', 'ask', 'come', 'go', 'do', 'name', 'sign', 'language'],
  },
];

/** All signs across all lessons — used to generate quiz distractors. */
export const allLessonSigns: string[] = Array.from(
  new Set(lessons.flatMap(l => l.signs))
);
