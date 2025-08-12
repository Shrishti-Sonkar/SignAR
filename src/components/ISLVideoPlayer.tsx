import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SpeechProcessor } from '@/utils/speechProcessor';

// Modular ISL Video Dataset Configuration
export interface ISLVideoDataset {
  name: string;
  baseUrl?: string;
  videos: Record<string, string>;
}

// Enhanced ISL Video Dataset - Modular and easily replaceable
export const DEFAULT_ISL_DATASET: ISLVideoDataset = {
  name: "Local ISL Dataset",
  baseUrl: "/videos/isl/",
  videos: {
    // Greetings and basics
    'hello': 'hello.mp4',
    'hi': 'hello.mp4',
    'good': 'good.mp4',
    'morning': 'morning.mp4',
    'evening': 'evening.mp4',
    'night': 'night.mp4',
    'day': 'day.mp4',
    'thank': 'thank.mp4',
    'you': 'you.mp4',
    'please': 'please.mp4',
    'welcome': 'welcome.mp4',
    'sorry': 'sorry.mp4',
    
    // Questions and responses  
    'how': 'how.mp4',
    'what': 'what.mp4',
    'where': 'where.mp4',
    'when': 'when.mp4',
    'why': 'why.mp4',
    'who': 'who.mp4',
    'yes': 'yes.mp4',
    'no': 'no.mp4',
    
    // Personal and family
    'i': 'i.mp4',
    'my': 'my.mp4',
    'your': 'your.mp4',
    'name': 'name.mp4',
    'is': 'is.mp4',
    'am': 'am.mp4',
    'are': 'are.mp4',
    
    // Common verbs
    'have': 'have.mp4',
    'go': 'go.mp4',
    'come': 'come.mp4',
    'see': 'see.mp4',
    'know': 'know.mp4',
    'want': 'want.mp4',
    'need': 'need.mp4',
    'help': 'help.mp4',
    'eat': 'eat.mp4',
    'drink': 'drink.mp4',
    
    // Common nouns
    'water': 'water.mp4',
    'food': 'food.mp4',
    'home': 'home.mp4',
    'school': 'school.mp4',
    'work': 'work.mp4',
    'family': 'family.mp4',
    'friend': 'friend.mp4',
    
    // Emotions
    'happy': 'happy.mp4',
    'sad': 'sad.mp4',
    'love': 'love.mp4',
    'like': 'like.mp4',
    
    // Numbers (1-10)
    'one': 'numbers/one.mp4',
    'two': 'numbers/two.mp4',
    'three': 'numbers/three.mp4',
    'four': 'numbers/four.mp4',
    'five': 'numbers/five.mp4',
    'six': 'numbers/six.mp4',
    'seven': 'numbers/seven.mp4',
    'eight': 'numbers/eight.mp4',
    'nine': 'numbers/nine.mp4',
    'ten': 'numbers/ten.mp4'
  }
};

// Method to update dataset (for easy swapping)
export const updateISLDataset = (newDataset: Partial<ISLVideoDataset>) => {
  Object.assign(DEFAULT_ISL_DATASET, newDataset);
};

// Method to load dataset from external source
export const loadDatasetFromAPI = async (apiUrl: string): Promise<void> => {
  try {
    const response = await fetch(apiUrl);
    const dataset = await response.json();
    updateISLDataset(dataset);
  } catch (error) {
    console.error('Failed to load dataset from API:', error);
  }
};

// Alternative datasets can be easily added
export const KAGGLE_ISL_DATASET: ISLVideoDataset = {
  name: "Kaggle ISL Dataset",
  baseUrl: "https://kaggle-dataset-url.com/",
  videos: {
    // Can be populated with Kaggle dataset URLs
  }
};

// Video preloading utility
class VideoPreloader {
  private static preloadedVideos = new Map<string, HTMLVideoElement>();
  private static preloadQueue = new Set<string>();

  static async preloadVideo(url: string): Promise<HTMLVideoElement> {
    if (this.preloadedVideos.has(url)) {
      return this.preloadedVideos.get(url)!;
    }

    if (this.preloadQueue.has(url)) {
      // Wait for ongoing preload
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (this.preloadedVideos.has(url)) {
            clearInterval(checkInterval);
            resolve(this.preloadedVideos.get(url)!);
          }
        }, 100);
      });
    }

    this.preloadQueue.add(url);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true; // Required for autoplay in most browsers
      
      video.oncanplaythrough = () => {
        this.preloadedVideos.set(url, video);
        this.preloadQueue.delete(url);
        resolve(video);
      };
      
      video.onerror = () => {
        this.preloadQueue.delete(url);
        reject(new Error(`Failed to preload video: ${url}`));
      };
      
      video.src = url;
    });
  }

  static preloadVideoList(urls: string[]) {
    urls.forEach(url => {
      this.preloadVideo(url).catch(console.warn);
    });
  }

  static clearCache() {
    this.preloadedVideos.clear();
    this.preloadQueue.clear();
  }
}

export interface ISLVideoPlayerHandle {
  playSequence(glosses: string[]): Promise<void>;
  stopSequence(): void;
  reset(): void;
}

interface ISLVideoPlayerProps {
  className?: string;
  currentGlosses?: string[];
  isPlaying?: boolean;
  dataset?: ISLVideoDataset;
  preloadVideos?: boolean;
  onSequenceComplete?: () => void;
}

export const ISLVideoPlayer = forwardRef<ISLVideoPlayerHandle, ISLVideoPlayerProps>(
  ({ 
    className = "", 
    currentGlosses = [], 
    isPlaying = false, 
    dataset = DEFAULT_ISL_DATASET,
    preloadVideos = true,
    onSequenceComplete
  }, ref) => {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const [isSequencePlaying, setIsSequencePlaying] = useState(false);
    const [playbackQueue, setPlaybackQueue] = useState<string[]>([]);
    const [currentWord, setCurrentWord] = useState<string>('');
    const [availableVideos, setAvailableVideos] = useState<string[]>([]);
    const [missingWords, setMissingWords] = useState<string[]>([]);
    const [isPreloading, setIsPreloading] = useState(false);
    const [videoError, setVideoError] = useState<string>('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const { toast } = useToast();

    // Get video URL for a gloss
    const getVideoUrl = (gloss: string): string | null => {
      const videoPath = dataset.videos[gloss.toUpperCase()];
      if (!videoPath) return null;
      
      return dataset.baseUrl ? `${dataset.baseUrl}${videoPath}` : videoPath;
    };

    // Find available videos for glosses
    const findAvailableVideos = (glosses: string[]) => {
      const available: string[] = [];
      const missing: string[] = [];
      
      glosses.forEach(gloss => {
        if (getVideoUrl(gloss)) {
          available.push(gloss.toUpperCase());
        } else {
          missing.push(gloss);
        }
      });
      
      return { available, missing };
    };

    // Preload videos for better performance
    const preloadVideosForGlosses = async (glosses: string[]) => {
      if (!preloadVideos) return;
      
      setIsPreloading(true);
      const urls = glosses
        .map(gloss => getVideoUrl(gloss))
        .filter(Boolean) as string[];
      
      try {
        VideoPreloader.preloadVideoList(urls);
        toast({
          title: "Videos Preloaded",
          description: `${urls.length} videos ready for smooth playback`,
        });
      } catch (error) {
        console.warn('Video preloading failed:', error);
      } finally {
        setIsPreloading(false);
      }
    };

    // Play next video in sequence
    const playNextVideo = async () => {
      if (currentVideoIndex < playbackQueue.length) {
        const currentGloss = playbackQueue[currentVideoIndex];
        setCurrentWord(currentGloss);
        setVideoError('');
        
        const videoUrl = getVideoUrl(currentGloss);
        
        if (videoRef.current && videoUrl) {
          try {
            videoRef.current.src = videoUrl;
            await videoRef.current.play();
          } catch (error) {
            console.error('Error playing video:', error);
            setVideoError(`Failed to play video for "${currentGloss}"`);
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
        onSequenceComplete?.();
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

    // Expose methods via ref with enhanced word processing
    useImperativeHandle(ref, () => ({
      async playSequence(glosses: string[]): Promise<void> {
        // Process words using SpeechProcessor for consistency
        const processedWords = glosses.flatMap(word => 
          SpeechProcessor.processRecognizedText(word.toString())
        );

        // Validate which words have videos available
        const { valid: availableWords, missing: missingWords } = SpeechProcessor.validateWordsForSigning(processedWords);
        
        // Convert to uppercase for video lookup
        const upperAvailable = availableWords.map(w => w.toUpperCase());
        const { available, missing } = findAvailableVideos(upperAvailable);
        
        setAvailableVideos(available);
        setMissingWords([...missing, ...missingWords]);
        setPlaybackQueue(available);
        setCurrentVideoIndex(0);
        
        // Preload videos if enabled
        if (preloadVideos && available.length > 0) {
          await preloadVideosForGlosses(available);
        }
        
        setIsSequencePlaying(true);
        
        const totalMissing = missing.length + missingWords.length;
        if (totalMissing > 0) {
          toast({
            title: `${totalMissing} word(s) not found`,
            description: `Videos not available: ${[...missing, ...missingWords].join(', ')}`,
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
        setVideoError('');
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
        setVideoError('');
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }), [isSequencePlaying, playbackQueue, currentVideoIndex, dataset, preloadVideos]);

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
            <div className="flex items-center justify-center gap-2 mt-2">
              <p className="text-sm text-muted-foreground">
                {isSequencePlaying ? `Playing: ${currentWord}` : 'Ready to play sign videos'}
              </p>
              {isPreloading && (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-xs text-primary">Preloading...</span>
                </>
              )}
            </div>
          </div>

          {/* Video Player */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[400px] flex items-center justify-center">
            {videoError ? (
              <Alert variant="destructive" className="m-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{videoError}</AlertDescription>
              </Alert>
            ) : (
              <video
                ref={videoRef}
                className="max-w-full max-h-full object-contain"
                onEnded={handleVideoEnded}
                controls={false}
                muted={false}
              >
                Your browser does not support the video tag.
              </video>
            )}
            
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
              Dataset: {dataset.name} ({Object.keys(dataset.videos).length} words available)
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {preloadVideos ? 'Videos preloaded for smooth playback' : 'Live streaming mode'}
            </p>
          </div>
        </Card>
      </div>
    );
  }
);

ISLVideoPlayer.displayName = 'ISLVideoPlayer';

export default ISLVideoPlayer;