import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
}

interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// Web Speech API hook for speech recognition
export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  const isSupported = Boolean(
    typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  );

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = 
      (window as any).webkitSpeechRecognition || 
      (window as any).SpeechRecognition;

    const recognition = new SpeechRecognition();
    
    // Configure recognition settings
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.language ?? 'en-US';
    recognition.maxAlternatives = options.maxAlternatives ?? 1;

    // Handle successful speech recognition
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptPart;
        } else {
          interimTranscript += transcriptPart;
        }
      }

      // Update transcript with debouncing for interim results
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setError(null);
      } else if (interimTranscript && options.interimResults) {
        // Debounce interim results to avoid excessive updates
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          setTranscript(prev => prev + interimTranscript);
        }, 100);
      }
    };

    // Handle recognition start
    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    // Handle recognition end
    recognition.onend = () => {
      setIsListening(false);
    };

    // Handle recognition errors
    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
      
      // Provide user-friendly error messages
      const errorMessages: Record<string, string> = {
        'network': 'Network error occurred. Please check your connection.',
        'not-allowed': 'Microphone access denied. Please allow microphone permissions.',
        'no-speech': 'No speech detected. Please try speaking again.',
        'audio-capture': 'Audio capture failed. Please check your microphone.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech recognition service not allowed.'
      };
      
      setError(errorMessages[event.error] || `Speech recognition error: ${event.error}`);
    };

    return recognition;
  }, [isSupported, options]);

  // Start listening for speech
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) return;

    try {
      recognitionRef.current = initializeRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      setError('Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isSupported, isListening, initializeRecognition]);

  // Stop listening for speech
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};

export default useSpeechRecognition;