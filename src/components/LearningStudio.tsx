import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  Clock,
  Star,
  CheckCircle2,
  PlayCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LearningStudioProps {
  onStartLesson: (lessonId: string) => void;
}

const LearningStudio: React.FC<LearningStudioProps> = ({ onStartLesson }) => {
  const { toast } = useToast();
  const [userProgress, setUserProgress] = useState({
    totalLessons: 24,
    completedLessons: 8,
    currentStreak: 5,
    totalPoints: 1250
  });

  const lessons = [
    {
      id: 'basics-1',
      title: 'Basic Greetings',
      description: 'Learn hello, goodbye, thank you, and please',
      difficulty: 'Beginner',
      duration: '15 min',
      signs: ['HELLO', 'GOODBYE', 'THANK-YOU', 'PLEASE'],
      completed: true,
      locked: false
    },
    {
      id: 'basics-2',
      title: 'Numbers 1-10',
      description: 'Practice counting from 1 to 10 in ISL',
      difficulty: 'Beginner',
      duration: '20 min',
      signs: ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'],
      completed: true,
      locked: false
    },
    {
      id: 'family',
      title: 'Family Members',
      description: 'Signs for mother, father, sister, brother',
      difficulty: 'Beginner',
      duration: '25 min',
      signs: ['MOTHER', 'FATHER', 'SISTER', 'BROTHER'],
      completed: false,
      locked: false
    },
    {
      id: 'emotions',
      title: 'Emotions & Feelings',
      description: 'Express happiness, sadness, anger, fear',
      difficulty: 'Intermediate',
      duration: '30 min',
      signs: ['HAPPY', 'SAD', 'ANGRY', 'SCARED'],
      completed: false,
      locked: false
    },
    {
      id: 'daily-activities',
      title: 'Daily Activities',
      description: 'Eat, drink, sleep, work, study',
      difficulty: 'Intermediate',
      duration: '35 min',
      signs: ['EAT', 'DRINK', 'SLEEP', 'WORK'],
      completed: false,
      locked: true
    },
    {
      id: 'conversation',
      title: 'Basic Conversation',
      description: 'Put it all together in simple conversations',
      difficulty: 'Advanced',
      duration: '45 min',
      signs: ['CONVERSATION', 'QUESTION', 'ANSWER'],
      completed: false,
      locked: true
    }
  ];

  const challenges = [
    {
      id: 'daily-practice',
      title: 'Daily Practice',
      description: 'Practice signs for 10 minutes',
      reward: '50 XP',
      completed: false
    },
    {
      id: 'perfect-score',
      title: 'Perfect Score',
      description: 'Get 100% on any lesson',
      reward: '100 XP',
      completed: true
    },
    {
      id: 'streak-week',
      title: 'Weekly Streak',
      description: 'Practice 7 days in a row',
      reward: '200 XP',
      completed: false
    }
  ];

  const handleStartLesson = (lesson: any) => {
    if (lesson.locked) {
      toast({
        title: "Lesson Locked",
        description: "Complete previous lessons to unlock this one",
        variant: "destructive"
      });
      return;
    }

    onStartLesson(lesson.id);
    toast({
      title: "Lesson Started",
      description: `Starting "${lesson.title}" - ${lesson.duration}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-signar-success';
      case 'Intermediate': return 'bg-signar-warning';
      case 'Advanced': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const progressPercentage = (userProgress.completedLessons / userProgress.totalLessons) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="p-6 bg-gradient-to-r from-signar-blue to-signar-teal text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Your Learning Journey</h2>
            <p className="text-white/80">Keep up the great work!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{userProgress.totalPoints}</div>
            <div className="text-sm text-white/80">XP Points</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{userProgress.completedLessons}</div>
            <div className="text-sm text-white/80">Lessons Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{userProgress.currentStreak}</div>
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
            <BookOpen className="w-5 h-5 text-signar-blue" />
            <h3 className="text-xl font-semibold">Lessons</h3>
          </div>
          
          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                className={`p-4 transition-all hover:shadow-md ${
                  lesson.locked ? 'opacity-60' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                      {lesson.completed && (
                        <CheckCircle2 className="w-4 h-4 text-signar-success" />
                      )}
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
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.duration}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {lesson.signs.map((sign, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {sign}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Button
                    variant={lesson.completed ? "secondary" : "signar"}
                    size="sm"
                    onClick={() => handleStartLesson(lesson)}
                    disabled={lesson.locked}
                    className="ml-4"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    {lesson.completed ? 'Review' : 'Start'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-signar-blue" />
            <h3 className="text-xl font-semibold">Daily Challenges</h3>
          </div>
          
          <div className="space-y-3">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{challenge.title}</h4>
                      {challenge.completed && (
                        <CheckCircle2 className="w-4 h-4 text-signar-success" />
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
          <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
            <div className="text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <h4 className="font-semibold mb-1">Rising Star</h4>
              <p className="text-xs text-white/80">
                Complete 5 more lessons to earn this badge!
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LearningStudio;