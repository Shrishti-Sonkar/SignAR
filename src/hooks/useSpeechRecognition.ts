import { useState, useCallback, useRef, useEffect } from 'react';
import { SpeechProcessor } from '@/utils/speechProcessor';

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

      // Update transcript with enhanced processing for final results
      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript);
        // Process the speech text to handle merged words and cleanup
        const processedWords = SpeechProcessor.processRecognizedText(finalTranscript);
        const cleanedText = processedWords.join(' ');
        console.log('🎤 Processed text:', cleanedText);
        
        setTranscript(prev => {
          const combined = prev + ' ' + cleanedText;
          return combined.trim();
        });
        setError(null);
      } else if (interimTranscript && options.interimResults) {
        console.log('🎤 Interim transcript:', interimTranscript);
        // For interim results, show the raw text but don't process yet
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = setTimeout(() => {
          setTranscript(prev => prev + ' ' + interimTranscript);
        }, 100);
      }
    };

    // Handle recognition start
    recognition.onstart = () => {
      console.log('🎤 Recognition started successfully');
      setIsListening(true);
      setError(null);
    };

    // Handle recognition end
    recognition.onend = () => {
      console.log('🎤 Recognition ended');
      setIsListening(false);
    };

    // Handle recognition errors
    recognition.onerror = (event: any) => {
      console.error('🎤 Recognition error:', event.error, event);
      setError(event.error);
      setIsListening(false);
      
      // Provide user-friendly error messages
      const errorMessages: Record<string, string> = {
        'network': 'Network error occurred. Please check your connection.',
        'not-allowed': 'Microphone access denied. Please allow microphone permissions and try again.',
        'no-speech': 'No speech detected. Please try speaking again.',
        'audio-capture': 'Audio capture failed. Please check your microphone.',
        'aborted': 'Speech recognition was aborted.',
        'service-not-allowed': 'Speech recognition service not allowed.',
        'bad-grammar': 'Grammar error in speech recognition.',
        'language-not-supported': 'Language not supported by speech recognition.'
      };
      
      const userFriendlyMessage = errorMessages[event.error] || `Speech recognition error: ${event.error}`;
      console.error('🎤 User-friendly error:', userFriendlyMessage);
      setError(userFriendlyMessage);
    };

    return recognition;
  }, [isSupported, options]);

  // Start listening for speech
  const startListening = useCallback(() => {
    console.log('🎤 startListening called');
    console.log('🎤 isSupported:', isSupported);
    console.log('🎤 isListening:', isListening);
    console.log('🎤 window.location.protocol:', window.location.protocol);
    
    if (!isSupported) {
      const errorMsg = 'Speech recognition is not supported in this browser';
      console.error('🎤 Error:', errorMsg);
      setError(errorMsg);
      return;
    }

    // Check if we're on HTTPS (required for speech recognition)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      const errorMsg = 'Speech recognition requires HTTPS connection';
      console.error('🎤 Error:', errorMsg);
      setError(errorMsg);
      return;
    }

    if (isListening) {
      console.log('🎤 Already listening, skipping');
      return;
    }

    try {
      console.log('🎤 Initializing recognition...');
      recognitionRef.current = initializeRecognition();
      if (recognitionRef.current) {
        console.log('🎤 Starting recognition...');
        recognitionRef.current.start();
      } else {
        throw new Error('Failed to initialize speech recognition');
      }
    } catch (err) {
      const errorMsg = `Failed to start speech recognition: ${err instanceof Error ? err.message : 'Unknown error'}`;
      console.error('🎤 Error:', errorMsg, err);
      setError(errorMsg);
      setIsListening(false);
    }
  }, [isSupported, isListening, initializeRecognition]);

  // Stop listening for speech
  const stopListening = useCallback(() => {
    console.log('🎤 stopListening called');
    if (recognitionRef.current) {
      console.log('🎤 Stopping recognition...');
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    console.log('🎤 resetTranscript called');
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