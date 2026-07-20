import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  Target,
  Trophy,
  Star,
  CheckCircle2,
  PlayCircle,
  Lock,
  Flame,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { lessons, Lesson } from '@/data/lessons';
import {
  loadProgress,
  isLessonUnlocked,
  getChallenges,
} from '@/lib/progress';
import LessonPlayer from '@/components/LessonPlayer';

interface LearningStudioProps {
  onStartLesson: (lessonId: string) => void;
}

const LearningStudio: React.FC<LearningStudioProps> = ({ onStartLesson }) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(loadProgress);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const refresh = useCallback(() => setProgress(loadProgress()), []);

  const handleStartLesson = (lesson: Lesson) => {
    if (!isLessonUnlocked(lesson.id, progress)) {
      toast({
        title: 'Lesson Locked',
        description: 'Complete the previous lesson to unlock this one',
        variant: 'destructive',
      });
      return;
    }
    onStartLesson(lesson.id);
    setActiveLesson(lesson);
  };

  const handleExitLesson = () => {
    setActiveLesson(null);
    refresh(); // pick up XP/streak/completions saved by the player
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-signlang-success';
      case 'Intermediate': return 'bg-signlang-warning';
      case 'Advanced': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  // A lesson is in progress → show only the player
  if (activeLesson) {
    return <LessonPlayer lesson={activeLesson} onExit={handleExitLesson} />;
  }

  const completedCount = Object.keys(progress.completedLessons).length;
  const progressPercentage = (completedCount / lessons.length) * 100;
  const challenges = getChallenges(progress);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-signlang-blue to-signlang-teal text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your Learning Journey</h2>
            <p className="text-white/80">
              {completedCount === 0
                ? 'Start your first lesson below!'
                : 'Keep up the great work!'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{progress.xp}</div>
            <div className="text-sm text-white/80">XP Points</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{completedCount}/{lessons.length}</div>
            <div className="text-sm text-white/80">Lessons Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold flex items-center justify-center gap-1">
              {progress.streak > 0 && <Flame className="w-5 h-5" />}
              {progress.streak}
            </div>
            <div className="text-sm text-white/80">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-white/80">Overall Progress</div>
          </div>
        </div>

        <Progress value={progressPercentage} className="bg-white/20" />
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lessons */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-signlang-blue" />
            <h3 className="text-xl font-semibold">Lessons</h3>
          </div>

          <div className="grid gap-4">
            {lessons.map(lesson => {
              const result = progress.completedLessons[lesson.id];
              const unlocked = isLessonUnlocked(lesson.id, progress);
              return (
                <Card
                  key={lesson.id}
                  className={`p-4 transition-all hover:shadow-md ${
                    unlocked ? 'hover:scale-[1.02]' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                        {result && <CheckCircle2 className="w-4 h-4 text-signlang-success" />}
                        {!unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        {lesson.description}
                      </p>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant="secondary"
                          className={`${getDifficultyColor(lesson.difficulty)} text-white`}
                        >
                          {lesson.difficulty}
                        </Badge>
                        <Badge variant="outline">{lesson.signs.length} signs</Badge>
                        {result && (
                          <Badge variant="outline" className="text-signlang-success border-signlang-success">
                            Best: {Math.round(result.bestScore * 100)}%
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {lesson.signs.map((sign, index) => (
                          <Badge key={index} variant="secondary" className="text-xs capitalize">
                            {sign}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant={result ? 'secondary' : 'signlang'}
                      size="sm"
                      onClick={() => handleStartLesson(lesson)}
                      disabled={!unlocked}
                      className="ml-4"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      {result ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-signlang-blue" />
            <h3 className="text-xl font-semibold">Daily Challenges</h3>
          </div>

          <div className="space-y-3">
            {challenges.map(challenge => (
              <Card key={challenge.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      {challenge.completed && (
                        <CheckCircle2 className="w-4 h-4 text-signlang-success" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {challenge.description}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      {challenge.reward}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Achievement Badge */}
          <Card
            className={`p-4 text-white ${
              progress.streak >= 7
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                : 'bg-gradient-to-r from-gray-300 to-gray-400'
            }`}
          >
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Rising Star</h4>
              <p className="text-xs text-white/80">
                {progress.streak >= 7
                  ? 'Earned! 7-day practice streak 🎉'
                  : `Practice ${7 - progress.streak} more day${7 - progress.streak === 1 ? '' : 's'} in a row to earn this badge`}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningStudio;
