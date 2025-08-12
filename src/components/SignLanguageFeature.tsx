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
  AlertCircle,
  Sparkles 
} from 'lucide-react';
import ISLVideoPlayer, { ISLVideoPlayerHandle } from '@/components/ISLVideoPlayer';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { TranslationService } from '@/services/aiServices';
import { useToast } from '@/hooks/use-toast';

interface SignLanguageFeatureProps {
  className?: string;
}

const SignLanguageFeature: React.FC<SignLanguageFeatureProps> = ({ className = "" }) => {
  const [currentText, setCurrentText] = useState<string>('');
  const [currentGlosses, setCurrentGlosses] = useState<string[]>([]);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  
  const videoPlayerRef = useRef<ISLVideoPlayerHandle>(null);
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

  // Handle transcript updates with enhanced processing
  useEffect(() => {
    if (transcript && transcript.trim().length > 0) {
      // Debounce transcript processing to avoid too many API calls
      const timeoutId = setTimeout(() => {
        handleTranscriptUpdate(transcript);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [transcript]);

  // Process new transcript and convert to sign language with enhanced processing
  const handleTranscriptUpdate = useCallback(async (text: string) => {
    try {
      // Get AI-enhanced translation
      const glosses = await TranslationService.translateToGlosses(text);
      
      setCurrentGlosses(glosses);
      setCurrentText(text);

      toast({
        title: "Translation Complete", 
        description: `Converted "${text}" to ${glosses.length} sign(s)`,
      });

      // Auto-play video sequence with enhanced processing
      if (glosses.length > 0 && videoPlayerRef.current) {
        setIsVideoPlaying(true);
        await videoPlayerRef.current.playSequence(glosses);
      }
    } catch (error) {
      // Enhanced fallback using speech processor
      import('@/utils/speechProcessor').then(({ SpeechProcessor }) => {
        const processedResult = SpeechProcessor.prepareForSigning(text);
        const glosses = processedResult.availableWords.map(word => word.toUpperCase());
        
        setCurrentGlosses(glosses);
        setCurrentText(text);

        if (processedResult.missingWords.length > 0) {
          toast({
            title: "Partial Translation",
            description: `${processedResult.availableWords.length} words available, ${processedResult.missingWords.length} missing`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Local Translation",
            description: `Using offline dictionary for "${text}"`
          });
        }

        // Auto-play available video sequence
        if (glosses.length > 0 && videoPlayerRef.current) {
          setIsVideoPlaying(true);
          videoPlayerRef.current.playSequence(glosses);
        }
      });
    }
  }, [toast]);

  // Play sign video sequence
  const playSignVideoSequence = useCallback(async () => {
    if (currentGlosses.length === 0) {
      toast({
        title: "No Signs Available",
        description: "No sign videos found for the current text",
        variant: "destructive"
      });
      return;
    }

    setIsVideoPlaying(true);
    if (videoPlayerRef.current) {
      await videoPlayerRef.current.playSequence(currentGlosses);
    }
  }, [currentGlosses, toast]);

  // Stop video playback
  const stopVideoPlayback = useCallback(() => {
    setIsVideoPlaying(false);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.stopSequence();
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
    stopVideoPlayback();
    resetTranscript();
    setCurrentText('');
    setCurrentGlosses([]);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.reset();
    }
  }, [stopVideoPlayback, resetTranscript]);

  // Handle video sequence completion
  const handleSequenceComplete = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main ISL Video Player */}
      <ISLVideoPlayer 
        ref={videoPlayerRef}
        currentGlosses={currentGlosses}
        isPlaying={isVideoPlaying}
        preloadVideos={true}
        onSequenceComplete={handleSequenceComplete}
        className="w-full"
      />

      {/* Control Panel */}
      <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-semibold">Voice Control</h4>
              <div className="flex items-center gap-2">
                <Badge variant={speechSupported ? "default" : "destructive"}>
                  {speechSupported ? "Supported" : "Not Supported"}
                </Badge>
                {!speechSupported && (
                  <Alert className="flex-1 ml-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Speech recognition not supported in this browser. Try Chrome, Edge, or Safari.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

          {/* Microphone and Control Buttons */}
          <div className="flex gap-3 flex-wrap">
            <Button
              variant={isListening ? "destructive" : "default"}
              onClick={() => {
                console.log('🎤 Button clicked, isListening:', isListening);
                console.log('🎤 speechSupported:', speechSupported);
                toggleMicrophone();
              }}
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
              variant={isVideoPlaying ? "destructive" : "secondary"}
              onClick={isVideoPlaying ? stopVideoPlayback : playSignVideoSequence}
              disabled={currentGlosses.length === 0}
            >
              {isVideoPlaying ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Videos
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
              
              {currentGlosses.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Sign Sequence:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentGlosses.map((gloss, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-primary/10 text-primary"
                      >
                        {gloss}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Status Display */}
      {currentText && (
        <Card className="p-4">
          <div className="text-center">
            <Badge 
              variant={isVideoPlaying ? "default" : "secondary"}
              className={isVideoPlaying ? "bg-green-500 text-white animate-pulse" : ""}
            >
              {isVideoPlaying ? "Playing Sign Videos" : "Ready"}
            </Badge>
            
            <p className="text-sm text-muted-foreground mt-2">
              Current: <span className="font-medium text-primary">{currentText}</span>
            </p>
            
            {currentGlosses.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {currentGlosses.length} sign(s) in sequence
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Accessibility Features */}
      <Card className="p-4 bg-primary/5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">
              Accessibility Features
            </h4>
            <p className="text-xs text-muted-foreground">
              Voice-to-sign translation • Real ISL videos • Replay controls • Preloaded for smooth playback
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignLanguageFeature;