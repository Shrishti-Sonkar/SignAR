import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Mic, 
  MicOff, 
  Play, 
  Square, 
  RotateCcw, 
  Volume2, 
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import Avatar3D, { type Avatar3DRef } from '@/components/Avatar3D';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { getSignClip, getSignClipsForSentence } from '@/utils/signDictionary';
import { TranslationService } from '@/services/aiServices';
import { useToast } from '@/hooks/use-toast';

interface SignLanguageFeatureProps {
  className?: string;
}

const SignLanguageFeature: React.FC<SignLanguageFeatureProps> = ({ className = "" }) => {
  const [currentGloss, setCurrentGloss] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [signClips, setSignClips] = useState<Array<{ gloss: string; clipPath: string | null; duration: number }>>([]);
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  
  const avatarRef = useRef<Avatar3DRef>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Speech recognition hook
  const {
    transcript,
    isListening,
    isSupported: speechSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition({
    continuous: false,
    interimResults: true,
    language: 'en-US'
  });

  // Handle transcript updates with debouncing
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      handleTranscriptUpdate(transcript);
    }
  }, [transcript]);

  // Process new transcript and convert to sign language
  const handleTranscriptUpdate = useCallback(async (text: string) => {
    try {
      // Get AI-enhanced translation
      const glosses = await TranslationService.translateToGlosses(text);
      const clips = getSignClipsForSentence(glosses.join(' '));
      
      setSignClips(clips);
      setCurrentGloss(text);
      setCurrentClipIndex(0);

      toast({
        title: "Translation Complete",
        description: `Converted "${text}" to ${clips.length} sign(s)`,
      });

      // Auto-play if we have valid clips
      if (clips.some(clip => clip.clipPath)) {
        playSignAnimation();
      }
    } catch (error) {
      // Fallback to local dictionary
      const clips = getSignClipsForSentence(text);
      setSignClips(clips);
      setCurrentGloss(text);
      setCurrentClipIndex(0);

      toast({
        title: "Local Translation",
        description: `Using offline dictionary for "${text}"`
      });
    }
  }, [toast]);

  // Play sign animation sequence
  const playSignAnimation = useCallback(() => {
    if (signClips.length === 0) {
      toast({
        title: "No Signs Available",
        description: "No sign animations found for the current text",
        variant: "destructive"
      });
      return;
    }

    setIsAnimating(true);
    setCurrentClipIndex(0);
    playNextClip(0);
  }, [signClips, toast]);

  // Play individual clip in sequence
  const playNextClip = useCallback((index: number) => {
    if (index >= signClips.length) {
      setIsAnimating(false);
      setCurrentClipIndex(0);
      return;
    }

    const clip = signClips[index];
    setCurrentClipIndex(index);

    if (clip.clipPath && avatarRef.current) {
      avatarRef.current.playSignAnimation(clip.clipPath);
    }

    // Schedule next clip
    const duration = (clip.duration * 1000) / playbackSpeed;
    playbackTimeoutRef.current = setTimeout(() => {
      playNextClip(index + 1);
    }, duration);
  }, [signClips, playbackSpeed]);

  // Stop animation
  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
    setCurrentClipIndex(0);
    
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    
    if (avatarRef.current) {
      avatarRef.current.stopAnimation();
    }
  }, []);

  // Toggle microphone
  const toggleMicrophone = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  }, [isListening, startListening, stopListening, resetTranscript]);

  // Reset everything
  const resetAll = useCallback(() => {
    stopAnimation();
    resetTranscript();
    setCurrentGloss('');
    setSignClips([]);
    setCurrentClipIndex(0);
  }, [stopAnimation, resetTranscript]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Avatar Display */}
      <Card className="p-6 shadow-xl bg-gradient-to-b from-white to-signar-blue-light/10">
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-foreground mb-2">
            SignAR™ 3D Avatar
          </h3>
          <Badge 
            variant={isAnimating ? "default" : "secondary"}
            className={isAnimating ? "bg-signar-success text-white animate-pulse" : ""}
          >
            {isAnimating ? `Signing (${currentClipIndex + 1}/${signClips.length})` : 'Ready'}
          </Badge>
        </div>

        {/* 3D Avatar Container */}
        <div className="h-[400px] bg-gradient-to-b from-signar-blue-light/20 to-transparent rounded-lg mb-4">
          <Avatar3D
            ref={avatarRef}
            isAnimating={isAnimating}
            currentSign={currentGloss}
            className="w-full h-full"
          />
        </div>
      </Card>

      {/* Control Panel */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Voice Control</h4>
            {!speechSupported && (
              <Alert className="flex-1 ml-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Speech recognition not supported in this browser
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Microphone Button */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={isListening ? "destructive" : "signar"}
              onClick={toggleMicrophone}
              disabled={!speechSupported}
              className="flex-1 sm:flex-none"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Speaking
                </>
              )}
            </Button>

            <Button
              variant={isAnimating ? "destructive" : "secondary"}
              onClick={isAnimating ? stopAnimation : playSignAnimation}
              disabled={signClips.length === 0}
            >
              {isAnimating ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Signs
                </>
              )}
            </Button>

            <Button variant="ghost" onClick={resetAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {/* Transcript Display */}
      {(transcript || speechError) && (
        <Card className="p-4">
          <h4 className="text-sm font-medium text-foreground mb-2">
            Speech Recognition
          </h4>
          
          {speechError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{speechError}</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Transcript:</strong> {transcript}
                </p>
              </div>
              
              {signClips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sign Sequence:</p>
                  <div className="flex flex-wrap gap-2">
                    {signClips.map((clip, index) => (
                      <Badge
                        key={index}
                        variant={
                          index === currentClipIndex && isAnimating 
                            ? "default" 
                            : clip.clipPath 
                              ? "secondary" 
                              : "outline"
                        }
                        className={
                          index === currentClipIndex && isAnimating 
                            ? "bg-signar-success text-white animate-pulse" 
                            : clip.clipPath 
                              ? "bg-signar-blue-light text-signar-blue-dark"
                              : "text-muted-foreground"
                        }
                      >
                        {clip.gloss} {!clip.clipPath && "(missing)"}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Playback Controls */}
      {signClips.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Playback Speed</p>
              <div className="flex gap-2">
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <Button
                    key={speed}
                    variant={playbackSpeed === speed ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setPlaybackSpeed(speed)}
                  >
                    {speed}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {signClips.filter(clip => clip.clipPath).length} / {signClips.length} signs available
              </p>
              <p className="text-xs text-muted-foreground">
                Duration: ~{Math.round(signClips.reduce((sum, clip) => sum + clip.duration, 0) / playbackSpeed)}s
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Accessibility Features */}
      <Card className="p-4 bg-signar-blue-light/10">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-signar-blue" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Accessibility Features
            </h4>
            <p className="text-xs text-muted-foreground">
              Voice-to-sign translation • Real-time captions • Replay controls • High contrast mode
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignLanguageFeature;