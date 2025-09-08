import React, { useState, useEffect } from 'react';
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
  PlayCircle,
  Video,
  Youtube,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LessonPlayer from './LessonPlayer';
import { youtubeLearningService, type LearningLesson } from '@/services/youtubeLearningService';

interface LearningStudioProps {
  onStartLesson: (lessonId: string) => void;
  onSignPlay?: (sign: string) => void;
}

const LearningStudio: React.FC<LearningStudioProps> = ({ onStartLesson, onSignPlay }) => {
  const { toast } = useToast();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LearningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({
    totalLessons: 24,
    completedLessons: 8,
    currentStreak: 5,
    totalPoints: 1250
  });
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(['basics-greetings']));

  // Load learning lessons from YouTube service
  useEffect(() => {
    const loadLessons = async () => {
      try {
        setLoading(true);
        const learningLessons = await youtubeLearningService.getLearningLessons();
        setLessons(learningLessons);
        setUserProgress(prev => ({
          ...prev,
          totalLessons: learningLessons.length
        }));
      } catch (error) {
        console.error('Error loading lessons:', error);
        toast({
          title: "Error Loading Lessons",
          description: "Failed to load learning content. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadLessons();
  }, [toast]);

  const handleStartLesson = async (lesson: LearningLesson) => {
    // Check if lesson is locked based on order and completed lessons
    const previousLessons = lessons.filter(l => l.order < lesson.order);
    const allPreviousCompleted = previousLessons.every(l => completedLessons.has(l.id));
    
    if (!allPreviousCompleted && lesson.order > 1) {
      toast({
        title: "Lesson Locked",
        description: "Complete previous lessons to unlock this one",
        variant: "destructive"
      });
      return;
    }

    try {
      // Enrich lesson with YouTube videos if available
      const enrichedLesson = await youtubeLearningService.enrichLessonWithYouTubeVideos(lesson);
      setActiveLesson(enrichedLesson.id);
      onStartLesson(enrichedLesson.id);
    } catch (error) {
      console.error('Error starting lesson:', error);
      setActiveLesson(lesson.id);
      onStartLesson(lesson.id);
    }
  };

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

  const handleLessonComplete = (lessonId: string, score: number) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    setUserProgress(prev => ({
      ...prev,
      completedLessons: prev.completedLessons + 1,
      totalPoints: prev.totalPoints + Math.round(score * 2),
      currentStreak: prev.currentStreak + 1
    }));
    
    setActiveLesson(null);
    
    toast({
      title: "Lesson Completed! 🎉",
      description: `You earned ${Math.round(score * 2)} XP! Score: ${score}%`,
    });
  };

  const handleBackToLessons = () => {
    setActiveLesson(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-signar-success';
      case 'Intermediate': return 'bg-signar-warning';
      case 'Advanced': return 'bg-destructive';
      default: return 'bg-secondary';
    }
  };

  const progressPercentage = (completedLessons.size / userProgress.totalLessons) * 100;

  // If a lesson is active, show the lesson player
  if (activeLesson) {
    const lesson = lessons.find(l => l.id === activeLesson);
    if (lesson) {
      return (
        <LessonPlayer
          lesson={lesson}
          onComplete={handleLessonComplete}
          onBack={handleBackToLessons}
          onSignPlay={onSignPlay || (() => {})}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Loading Learning Content</h3>
          <p className="text-muted-foreground">Fetching ISL lessons and videos...</p>
        </Card>
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{completedLessons.size}</div>
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
            {lessons.map((lesson) => {
              const isCompleted = completedLessons.has(lesson.id);
              const previousLessons = lessons.filter(l => l.order < lesson.order);
              const isLocked = lesson.order > 1 && !previousLessons.every(l => completedLessons.has(l.id));
              
              return (
              <Card 
                key={lesson.id} 
                className={`p-4 transition-all hover:shadow-md ${
                  isLocked ? 'opacity-60' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-foreground">{lesson.title}</h4>
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 text-signar-success" />
                      )}
                      {lesson.videos.length > 0 && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          {lesson.videos.length}
                        </Badge>
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
                    variant={isCompleted ? "secondary" : "signar"}
                    size="sm"
                    onClick={() => handleStartLesson(lesson)}
                    disabled={isLocked}
                    className="ml-4"
                  >
                    <PlayCircle className="w-4 h-4 mr-1" />
                    {isCompleted ? 'Review' : 'Start'}
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