import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw, 
  CheckCircle2,
  ArrowLeft,
  Star,
  Trophy
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type LearningLesson } from '@/services/youtubeLearningService';

interface LessonPlayerProps {
  lesson: LearningLesson;
  onComplete: (lessonId: string, score: number) => void;
  onBack: () => void;
  onSignPlay: (sign: string) => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ 
  lesson, 
  onComplete, 
  onBack,
  onSignPlay 
}) => {
  const { toast } = useToast();
  const [currentSignIndex, setCurrentSignIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSigns, setCompletedSigns] = useState<Set<number>>(new Set());
  const [lessonProgress, setLessonProgress] = useState(0);
  const [score, setScore] = useState(0);

  const currentSign = lesson.signs[currentSignIndex];
  const progress = (currentSignIndex / lesson.signs.length) * 100;

  useEffect(() => {
    const newProgress = (completedSigns.size / lesson.signs.length) * 100;
    setLessonProgress(newProgress);
    
    if (completedSigns.size === lesson.signs.length && completedSigns.size > 0) {
      const finalScore = Math.round((completedSigns.size / lesson.signs.length) * 100);
      setScore(finalScore);
      
      toast({
        title: "Lesson Completed! 🎉",
        description: `Great job! You scored ${finalScore}%`,
      });
      
      setTimeout(() => {
        onComplete(lesson.id, finalScore);
      }, 2000);
    }
  }, [completedSigns, lesson.signs.length, lesson.id, onComplete, toast]);

  const handlePlaySign = () => {
    setIsPlaying(true);
    onSignPlay(currentSign);
    
    setTimeout(() => {
      setIsPlaying(false);
      setCompletedSigns(prev => new Set([...prev, currentSignIndex]));
    }, 2000);
  };

  const handleNextSign = () => {
    if (currentSignIndex < lesson.signs.length - 1) {
      setCurrentSignIndex(currentSignIndex + 1);
    }
  };

  const handlePrevSign = () => {
    if (currentSignIndex > 0) {
      setCurrentSignIndex(currentSignIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentSignIndex(0);
    setCompletedSigns(new Set());
    setLessonProgress(0);
    setScore(0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Lessons
            </Button>
            
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{lesson.title}</h2>
              <Badge 
                className={`${getDifficultyColor(lesson.difficulty)} text-white`}
              >
                {lesson.difficulty}
              </Badge>
            </div>
            
            <p className="text-muted-foreground">{lesson.description}</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Progress</div>
            <div className="text-2xl font-bold">{Math.round(lessonProgress)}%</div>
            {score > 0 && (
              <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                Score: {score}%
              </div>
            )}
          </div>
        </div>
        
        <Progress value={lessonProgress} className="mb-4" />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{completedSigns.size} of {lesson.signs.length} signs completed</span>
          <span>{lesson.duration}</span>
        </div>
      </Card>

      {/* Main Learning Area */}
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Sign {currentSignIndex + 1} of {lesson.signs.length}
            </div>
            <h3 className="text-4xl font-bold text-primary">
              {currentSign}
            </h3>
            <div className="flex items-center justify-center gap-2">
              {completedSigns.has(currentSignIndex) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>

          {/* Play Button */}
          <div className="space-y-4">
            <Button
              size="lg"
              onClick={handlePlaySign}
              disabled={isPlaying}
              className="h-16 px-8 text-lg"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-6 h-6 mr-2" />
                  Playing...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Watch Sign
                </>
              )}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Watch the sign demonstration and practice along
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevSign}
              disabled={currentSignIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextSign}
              disabled={currentSignIndex === lesson.signs.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Sign Grid */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4">Lesson Overview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lesson.signs.map((sign, index) => (
            <Button
              key={index}
              variant={index === currentSignIndex ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentSignIndex(index)}
              className="relative"
            >
              {sign}
              {completedSigns.has(index) && (
                <CheckCircle2 className="w-3 h-3 absolute -top-1 -right-1 text-green-600" />
              )}
            </Button>
          ))}
        </div>
      </Card>

      {/* Completion Message */}
      {lessonProgress === 100 && (
        <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Lesson Completed!</h3>
          <p className="mb-4">
            Congratulations! You've mastered all {lesson.signs.length} signs in this lesson.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5" />
            <span className="text-xl font-bold">Final Score: {score}%</span>
            <Star className="w-5 h-5" />
          </div>
        </Card>
      )}
    </div>
  );
};

export default LessonPlayer;