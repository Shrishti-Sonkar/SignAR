// src/components/SignLanguageFeature.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, AlertCircle, Sparkles } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

import { getSignClipsForSentence, SignClip } from '@/utils/signDictionary';

export default function SignLanguageFeature() {
  const [clips, setClips] = useState<SignClip[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error,
  } = useSpeechRecognition({ continuous: true, interimResults: true, language: 'en-IN' });

  const handleStart = () => {
    resetTranscript();
    setClips([]);
    setCurrentIndex(0);
    startListening();
  };

  const handleStop = () => {
    stopListening();
    const sentence = transcript.trim();
    if (sentence) {
      setClips(getSignClipsForSentence(sentence));
      setCurrentIndex(0);
    }
  };

  // Play the clip queue
  useEffect(() => {
    const vid = videoRef.current;
    const clip = clips[currentIndex];
    if (vid && clip) {
      vid.src = clip.src;
      vid.play().catch(console.error);
    }
  }, [currentIndex, clips]);

  const handleEnded = () => {
    if (currentIndex < clips.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="mr-2" />
        <AlertDescription>
          Speech recognition is not supported in this browser. Try Chrome or Edge.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Sparkles className="mr-2" />
        <AlertDescription>Speak a sentence and see it signed in ISL.</AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="mr-2" />
          <AlertDescription>Microphone error: {error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center space-x-4">
        <button
          onClick={isListening ? handleStop : handleStart}
          className={`p-3 rounded-full text-white shadow transition-colors ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-signlang-blue'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? <MicOff /> : <Mic />}
        </button>
        <span className="font-medium">
          {transcript || (isListening ? 'Listening…' : 'Tap mic and speak...')}
        </span>
      </div>

      {clips.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Signing: <span className="font-semibold">{clips[currentIndex]?.gloss}</span>{' '}
            ({currentIndex + 1}/{clips.length})
          </p>
          <video
            ref={videoRef}
            muted
            playsInline
            controls={false}
            onEnded={handleEnded}
            className="mx-auto w-full max-w-sm rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
