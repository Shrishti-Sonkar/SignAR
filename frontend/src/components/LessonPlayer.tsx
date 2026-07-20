// src/components/LessonPlayer.tsx
// Plays a lesson: WATCH each sign video, then QUIZ (video → pick the word),
// then RESULTS with XP + persistence via recordLessonResult.

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Trophy,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  Lesson,
  allLessonSigns,
  LESSON_PASS_SCORE,
  XP_PER_CORRECT,
  XP_LESSON_BONUS,
  XP_PERFECT_BONUS,
} from '@/data/lessons';
import { recordLessonResult } from '@/lib/progress';
import { signDictionary } from '@/utils/signDictionary';

type Phase = 'watch' | 'quiz' | 'results';

interface QuizQuestion {
  sign: string;
  options: string[]; // 4 shuffled choices including the answer
}

interface LessonPlayerProps {
  lesson: Lesson;
  onExit: () => void; // called when the user leaves (results saved already)
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(lesson: Lesson): QuizQuestion[] {
  const pool = allLessonSigns.filter(s => !lesson.signs.includes(s));
  return shuffle(lesson.signs).map(sign => {
    // Prefer distractors from the same lesson, top up from the global pool
    const sameLesson = shuffle(lesson.signs.filter(s => s !== sign)).slice(0, 3);
    const distractors =
      sameLesson.length >= 3
        ? sameLesson
        : [...sameLesson, ...shuffle(pool)].slice(0, 3);
    return { sign, options: shuffle([sign, ...distractors]) };
  });
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ lesson, onExit }) => {
  const [phase, setPhase] = useState<Phase>('watch');
  const [watchIndex, setWatchIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const quiz = useMemo(() => buildQuiz(lesson), [lesson]);

  const currentSrc =
    phase === 'watch'
      ? signDictionary[lesson.signs[watchIndex]]?.src
      : phase === 'quiz'
        ? signDictionary[quiz[quizIndex]?.sign]?.src
        : undefined;

  useEffect(() => {
    const vid = videoRef.current;
    if (vid && currentSrc) {
      vid.src = currentSrc;
      vid.play().catch(() => {});
    }
  }, [currentSrc]);

  // --- Quiz answer handling ---
  const answer = (option: string) => {
    if (selected) return; // already answered this question
    setSelected(option);
    if (option === quiz[quizIndex].sign) {
      setCorrectCount(c => c + 1);
    }
  };

  const nextQuestion = () => {
    setSelected(null);
    if (quizIndex < quiz.length - 1) {
      setQuizIndex(i => i + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    const score = correctCount / quiz.length;
    const passed = score >= LESSON_PASS_SCORE;
    let xp = correctCount * XP_PER_CORRECT;
    if (passed) xp += XP_LESSON_BONUS;
    if (score >= 1) xp += XP_PERFECT_BONUS;
    recordLessonResult(lesson.id, score, xp, passed);
    setXpEarned(xp);
    setPhase('results');
  };

  const restart = () => {
    setPhase('watch');
    setWatchIndex(0);
    setQuizIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setXpEarned(0);
  };

  const score = correctCount / quiz.length;
  const passed = score >= LESSON_PASS_SCORE;

  // ---------- RESULTS ----------
  if (phase === 'results') {
    const confettiColors = ['#6366f1', '#2dd4bf', '#facc15', '#f472b6', '#34d399'];
    return (
      <Card className="p-8 text-center space-y-4 relative overflow-hidden animate-fade-in-up">
        {passed && (
          <div className="absolute inset-x-0 top-0 h-0 pointer-events-none" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="confetti-piece"
                style={{
                  left: `${(i * 100) / 24 + Math.random() * 3}%`,
                  backgroundColor: confettiColors[i % confettiColors.length],
                  animationDelay: `${Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}
        <Trophy
          className={`w-14 h-14 mx-auto ${
            passed ? 'text-yellow-500 animate-trophy' : 'text-muted-foreground'
          }`}
        />
        <h3 className="text-2xl font-bold">
          {passed ? (score >= 1 ? 'Perfect! 🎉' : 'Lesson Complete!') : 'Almost there!'}
        </h3>
        <p className="text-muted-foreground">
          You got {correctCount} of {quiz.length} correct ({Math.round(score * 100)}%).
          {!passed && ` You need ${Math.round(LESSON_PASS_SCORE * 100)}% to complete the lesson.`}
        </p>
        <Badge variant="secondary" className="text-base px-4 py-1 animate-pop-in">+{xpEarned} XP</Badge>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="w-4 h-4 mr-1" /> Try Again
          </Button>
          <Button variant="signlang" onClick={onExit}>
            Back to Lessons
          </Button>
        </div>
      </Card>
    );
  }

  // ---------- WATCH / QUIZ ----------
  const total = phase === 'watch' ? lesson.signs.length : quiz.length;
  const index = phase === 'watch' ? watchIndex : quizIndex;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Exit
        </Button>
        <div className="text-sm text-muted-foreground">
          {phase === 'watch' ? 'Learn' : 'Quiz'} · {index + 1}/{total}
        </div>
      </div>

      <Progress value={((index + (phase === 'quiz' && selected ? 1 : 0)) / total) * 100} />

      <div className="text-center">
        {phase === 'watch' && (
          <h3 className="text-2xl font-bold capitalize mb-2">{lesson.signs[watchIndex]}</h3>
        )}
        {phase === 'quiz' && (
          <h3 className="text-lg font-semibold mb-2">Which sign is this?</h3>
        )}
        <video
          ref={videoRef}
          muted
          playsInline
          loop
          controls={false}
          className="mx-auto w-full max-w-sm rounded-lg shadow"
        />
      </div>

      {phase === 'watch' ? (
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            disabled={watchIndex === 0}
            onClick={() => setWatchIndex(i => i - 1)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          {watchIndex < lesson.signs.length - 1 ? (
            <Button variant="signlang" onClick={() => setWatchIndex(i => i + 1)}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="signlang" onClick={() => setPhase('quiz')}>
              Start Quiz <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {quiz[quizIndex].options.map(option => {
              const isAnswer = option === quiz[quizIndex].sign;
              const isSelected = option === selected;
              return (
                <Button
                  key={option}
                  variant="outline"
                  className={`capitalize justify-between h-auto py-3 ${
                    selected
                      ? isAnswer
                        ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : isSelected
                          ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'opacity-50'
                      : ''
                  }`}
                  onClick={() => answer(option)}
                >
                  {option}
                  {selected && isAnswer && <CheckCircle2 className="w-4 h-4" />}
                  {selected && isSelected && !isAnswer && <XCircle className="w-4 h-4" />}
                </Button>
              );
            })}
          </div>
          {selected && (
            <div className="flex justify-center">
              <Button variant="signlang" onClick={nextQuestion}>
                {quizIndex < quiz.length - 1 ? 'Next Question' : 'See Results'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default LessonPlayer;
