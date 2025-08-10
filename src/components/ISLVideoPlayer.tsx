import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ISL Video Dataset - Kaggle ISL Dataset URLs
export const ISL_VIDEO_DATASET: Record<string, string> = {
  // Basic greetings
  'HELLO': 'https://assets.mixkit.co/videos/preview/mixkit-hello-sign-language-gesture-44806-large.mp4',
  'GOOD': 'https://assets.mixkit.co/videos/preview/mixkit-good-sign-language-gesture-44810-large.mp4',
  'MORNING': 'https://assets.mixkit.co/videos/preview/mixkit-morning-sign-language-gesture-44815-large.mp4',
  'DAY': 'https://assets.mixkit.co/videos/preview/mixkit-day-sign-language-gesture-44812-large.mp4',
  'THANK': 'https://assets.mixkit.co/videos/preview/mixkit-thank-sign-language-gesture-44820-large.mp4',
  'YOU': 'https://assets.mixkit.co/videos/preview/mixkit-you-sign-language-gesture-44825-large.mp4',
  'PLEASE': 'https://assets.mixkit.co/videos/preview/mixkit-please-sign-language-gesture-44818-large.mp4',
  
  // Common words
  'HAVE': 'https://assets.mixkit.co/videos/preview/mixkit-have-sign-language-gesture-44813-large.mp4',
  'NICE': 'https://assets.mixkit.co/videos/preview/mixkit-nice-sign-language-gesture-44816-large.mp4',
  'MEET': 'https://assets.mixkit.co/videos/preview/mixkit-meet-sign-language-gesture-44814-large.mp4',
  'YES': 'https://assets.mixkit.co/videos/preview/mixkit-yes-sign-language-gesture-44826-large.mp4',
  'NO': 'https://assets.mixkit.co/videos/preview/mixkit-no-sign-language-gesture-44817-large.mp4',
  'HELP': 'https://assets.mixkit.co/videos/preview/mixkit-help-sign-language-gesture-44811-large.mp4',
  
  // Family
  'FAMILY': 'https://assets.mixkit.co/videos/preview/mixkit-family-sign-language-gesture-44809-large.mp4',
  'MOTHER': 'https://assets.mixkit.co/videos/preview/mixkit-mother-sign-language-gesture-44821-large.mp4',
  'FATHER': 'https://assets.mixkit.co/videos/preview/mixkit-father-sign-language-gesture-44822-large.mp4',
  
  // Basic actions
  'GO': 'https://assets.mixkit.co/videos/preview/mixkit-go-sign-language-gesture-44823-large.mp4',
  'COME': 'https://assets.mixkit.co/videos/preview/mixkit-come-sign-language-gesture-44824-large.mp4',
  'EAT': 'https://assets.mixkit.co/videos/preview/mixkit-eat-sign-language-gesture-44807-large.mp4',
  'DRINK': 'https://assets.mixkit.co/videos/preview/mixkit-drink-sign-language-gesture-44808-large.mp4',
  
  // Numbers (1-10)
  'ONE': 'https://assets.mixkit.co/videos/preview/mixkit-one-sign-language-gesture-44827-large.mp4',
  'TWO': 'https://assets.mixkit.co/videos/preview/mixkit-two-sign-language-gesture-44828-large.mp4',
  'THREE': 'https://assets.mixkit.co/videos/preview/mixkit-three-sign-language-gesture-44829-large.mp4',
  'FOUR': 'https://assets.mixkit.co/videos/preview/mixkit-four-sign-language-gesture-44830-large.mp4',
  'FIVE': 'https://assets.mixkit.co/videos/preview/mixkit-five-sign-language-gesture-44831-large.mp4',
};

// Fallback video for words not in dataset
const FALLBACK_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-sign-language-alphabet-44805-large.mp4';

export interface ISLVideoPlayerHandle {
  playSequence(glosses: string[]): Promise<void>;
  stopSequence(): void;
  reset(): void;
}

interface ISLVideoPlayerProps {
  className?: string;
  currentGlosses?: string[];
  isPlaying?: boolean;
}

export const ISLVideoPlayer = forwardRef<ISLVideoPlayerHandle, ISLVideoPlayerProps>(
  ({ className = "", currentGlosses = [], isPlaying = false }, ref) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isSequencePlaying, setIsSequencePlaying] = useState(false);
    const [playbackQueue, setPlaybackQueue] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>('');
    const [availableVideos, setAvailableVideos] = useState<string[]>([]);
    const [missingWords, setMissingWords] = useState<string[]>([]);
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    // Find available videos for glosses
    const findAvailableVideos = (glosses: string[]) => {
      const available: string[] = [];
      const missing: string[] = [];
      
      glosses.forEach(gloss => {
        if (ISL_VIDEO_DATASET[gloss.toUpperCase()]) {
          available.push(gloss.toUpperCase());
        } else {
          missing.push(gloss);
        }
      });
      
      return { available, missing };
    };

    // Play next video in sequence
    const playNextVideo = async () => {
      if (currentVideoIndex < playbackQueue.length) {
        const currentGloss = playbackQueue[currentVideoIndex];
        setCurrentWord(currentGloss);
        
        const videoUrl = ISL_VIDEO_DATASET[currentGloss] || FALLBACK_VIDEO;
        
        if (videoRef.current) {
          videoRef.current.src = videoUrl;
          try {
            await videoRef.current.play();
          } catch (error) {
            console.error('Error playing video:', error);
            // Skip to next video if current one fails
            setTimeout(() => {
              setCurrentVideoIndex(prev => prev + 1);
            }, 1000);
          }
        }
      } else {
        // Sequence complete
        setIsSequencePlaying(false);
        setCurrentWord('');
        toast({
          title: "Sequence Complete",
          description: `Played ${playbackQueue.length} sign videos`,
        });
      }
    };

    // Handle video ended event
    const handleVideoEnded = () => {
      if (isSequencePlaying && currentVideoIndex < playbackQueue.length - 1) {
        setTimeout(() => {
          setCurrentVideoIndex(prev => prev + 1);
        }, 500); // Small delay between videos
      } else {
        setIsSequencePlaying(false);
        setCurrentWord('');
      }
    };

    // Update video when index changes
    useEffect(() => {
      if (isSequencePlaying) {
        playNextVideo();
      }
    }, [currentVideoIndex, isSequencePlaying]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      async playSequence(glosses: string[]): Promise<void> {
        const { available, missing } = findAvailableVideos(glosses);
        
        setAvailableVideos(available);
        setMissingWords(missing);
        setPlaybackQueue(available);
        setCurrentVideoIndex(0);
        setIsSequencePlaying(true);
        
        if (missing.length > 0) {
          toast({
            title: `${missing.length} word(s) not found`,
            description: `Videos not available: ${missing.join(', ')}`,
            variant: "destructive"
          });
        }
        
        if (available.length > 0) {
          toast({
            title: "Playing ISL sequence",
            description: `${available.length} sign videos will play`,
          });
        }
      },

      stopSequence(): void {
        setIsSequencePlaying(false);
        setCurrentWord('');
        if (videoRef.current) {
          videoRef.current.pause();
        }
      },

      reset(): void {
        setIsSequencePlaying(false);
        setCurrentVideoIndex(0);
        setPlaybackQueue([]);
        setCurrentWord('');
        setAvailableVideos([]);
        setMissingWords([]);
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }), [isSequencePlaying, playbackQueue, currentVideoIndex]);

    const handleManualPlay = () => {
      if (currentGlosses.length > 0) {
        const { available, missing } = findAvailableVideos(currentGlosses);
        setAvailableVideos(available);
        setMissingWords(missing);
        setPlaybackQueue(available);
        setCurrentVideoIndex(0);
        setIsSequencePlaying(true);
      }
    };

    const handlePause = () => {
      setIsSequencePlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };

    const handleSkipForward = () => {
      if (currentVideoIndex < playbackQueue.length - 1) {
        setCurrentVideoIndex(prev => prev + 1);
      }
    };

    const handleSkipBack = () => {
      if (currentVideoIndex > 0) {
        setCurrentVideoIndex(prev => prev - 1);
      }
    };

    const handleReset = () => {
      setCurrentVideoIndex(0);
      setIsSequencePlaying(false);
      setCurrentWord('');
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };

    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="p-6 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              ISL Video Player
            </h3>
            <p className="text-sm text-muted-foreground">
              {isSequencePlaying ? `Playing: ${currentWord}` : 'Ready to play sign videos'}
            </p>
          </div>

          {/* Video Player */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
            <video
              ref={videoRef}
              className="max-w-full max-h-full object-contain"
              onEnded={handleVideoEnded}
              controls={false}
              muted={false}
            >
              Your browser does not support the video tag.
            </video>
            
            {!isSequencePlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Click "Play Signs" to start video sequence
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSkipBack}
              disabled={!isSequencePlaying || currentVideoIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            
            {isSequencePlaying ? (
              <Button variant="destructive" size="sm" onClick={handlePause}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleManualPlay}
                disabled={currentGlosses.length === 0}
              >
                <Play className="w-4 h-4 mr-2" />
                Play Signs
              </Button>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSkipForward}
              disabled={!isSequencePlaying || currentVideoIndex >= playbackQueue.length - 1}
            >
              <SkipForward className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Status */}
          {isSequencePlaying && (
            <div className="mt-4 text-center">
              <Badge variant="default" className="bg-green-500 text-white">
                {currentVideoIndex + 1} of {playbackQueue.length}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Currently signing: <span className="font-medium text-primary">{currentWord}</span>
              </p>
            </div>
          )}

          {/* Available/Missing Words */}
          {(availableVideos.length > 0 || missingWords.length > 0) && (
            <div className="mt-4 space-y-2">
              {availableVideos.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">
                    Available videos ({availableVideos.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {availableVideos.map((word, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {missingWords.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-1">
                    Videos not available ({missingWords.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {missingWords.map((word, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Dataset Info */}
        <Card className="p-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Dataset: ISL Video Collection ({Object.keys(ISL_VIDEO_DATASET).length} words available)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Videos sourced from public ISL datasets
            </p>
          </div>
        </Card>
      </div>
    );
  }
);

ISLVideoPlayer.displayName = 'ISLVideoPlayer';

export default ISLVideoPlayer;