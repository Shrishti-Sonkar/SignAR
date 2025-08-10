import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Modular ISL Video Dataset Configuration
export interface ISLVideoDataset {
  name: string;
  baseUrl?: string;
  videos: Record<string, string>;
}

// Default ISL Video Dataset - easily swappable
export const DEFAULT_ISL_DATASET: ISLVideoDataset = {
  name: "Public ISL Dataset",
  baseUrl: "https://assets.mixkit.co/videos/preview/",
  videos: {
    // Basic greetings and common words
    'HELLO': 'mixkit-hello-sign-language-gesture-44806-large.mp4',
    'GOOD': 'mixkit-good-sign-language-gesture-44810-large.mp4',
    'MORNING': 'mixkit-morning-sign-language-gesture-44815-large.mp4',
    'DAY': 'mixkit-day-sign-language-gesture-44812-large.mp4',
    'HAVE': 'mixkit-have-sign-language-gesture-44813-large.mp4',
    'THANK': 'mixkit-thank-sign-language-gesture-44820-large.mp4',
    'YOU': 'mixkit-you-sign-language-gesture-44825-large.mp4',
    'PLEASE': 'mixkit-please-sign-language-gesture-44818-large.mp4',
    'NICE': 'mixkit-nice-sign-language-gesture-44816-large.mp4',
    'MEET': 'mixkit-meet-sign-language-gesture-44814-large.mp4',
    'YES': 'mixkit-yes-sign-language-gesture-44826-large.mp4',
    'NO': 'mixkit-no-sign-language-gesture-44817-large.mp4',
    'HELP': 'mixkit-help-sign-language-gesture-44811-large.mp4',
    'FAMILY': 'mixkit-family-sign-language-gesture-44809-large.mp4',
    'MOTHER': 'mixkit-mother-sign-language-gesture-44821-large.mp4',
    'FATHER': 'mixkit-father-sign-language-gesture-44822-large.mp4',
    'GO': 'mixkit-go-sign-language-gesture-44823-large.mp4',
    'COME': 'mixkit-come-sign-language-gesture-44824-large.mp4',
    'EAT': 'mixkit-eat-sign-language-gesture-44807-large.mp4',
    'DRINK': 'mixkit-drink-sign-language-gesture-44808-large.mp4',
    // Numbers
    'ONE': 'mixkit-one-sign-language-gesture-44827-large.mp4',
    'TWO': 'mixkit-two-sign-language-gesture-44828-large.mp4',
    'THREE': 'mixkit-three-sign-language-gesture-44829-large.mp4',
    'FOUR': 'mixkit-four-sign-language-gesture-44830-large.mp4',
    'FIVE': 'mixkit-five-sign-language-gesture-44831-large.mp4',
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

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      async playSequence(glosses: string[]): Promise<void> {
        const { available, missing } = findAvailableVideos(glosses);
        
        setAvailableVideos(available);
        setMissingWords(missing);
        setPlaybackQueue(available);
        setCurrentVideoIndex(0);
        
        // Preload videos if enabled
        if (preloadVideos && available.length > 0) {
          await preloadVideosForGlosses(available);
        }
        
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