// signlang-connect-main/src/hooks/useSpeechRecognition.ts
import { useState, useRef, useEffect, useCallback } from 'react';

type SpeechRecognitionOptions = {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
};

type UseSpeechRecognitionReturn = {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  startListening: (opts?: SpeechRecognitionOptions) => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

const createRecognition = (options: SpeechRecognitionOptions = {}) => {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
  rec.continuous = options.continuous ?? true;
  rec.interimResults = options.interimResults ?? true;
  rec.lang = options.language ?? 'en-IN';
  rec.maxAlternatives = options.maxAlternatives ?? 1;

  return rec;
};

export const useSpeechRecognition = (options: SpeechRecognitionOptions = {}): UseSpeechRecognitionReturn => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any | null>(null);
  const interimRef = useRef<string>('');
  const lastFinalRef = useRef<string>('');

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
    return () => {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop?.();
          recognitionRef.current = null;
        }
      } catch (e) {}
    };
  }, []);

  const processResult = useCallback((event: any) => {
    let finalTranscript = lastFinalRef.current || '';
    let interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcriptPiece = result[0]?.transcript || '';
      if (result.isFinal) {
        finalTranscript += transcriptPiece + ' ';
      } else {
        interimTranscript += transcriptPiece;
      }
    }

    interimRef.current = interimTranscript;
    lastFinalRef.current = finalTranscript.trim();
    setTranscript((finalTranscript + ' ' + interimTranscript).trim());
  }, []);

  const startListening = useCallback((opts: SpeechRecognitionOptions = {}) => {
    setError(null);
    if ((window as any).SpeechRecognition === undefined && (window as any).webkitSpeechRecognition === undefined) {
      setIsSupported(false);
      setError('Web Speech API is not supported in this browser.');
      return;
    }
    if (isListening && recognitionRef.current) return;

    const mergedOptions = { ...options, ...opts };
    const rec = createRecognition(mergedOptions);
    if (!rec) {
      setIsSupported(false);
      setError('Unable to create SpeechRecognition instance.');
      return;
    }

    recognitionRef.current = rec;
    rec.onresult = (e: any) => {
      processResult(e);
    };
    rec.onerror = (e: any) => {
      console.error('SpeechRecognition error', e);
      setError(e?.error || String(e));
    };
    rec.onend = () => {
      if (rec.continuous) {
        try {
          rec.start();
        } catch (err) {
          setIsListening(false);
        }
      } else {
        setIsListening(false);
      }
    };

    try {
      rec.start();
      setIsListening(true);
      setError(null);
    } catch (e: any) {
      console.error('Failed to start recognition', e);
      setError(e?.message || 'Failed to start speech recognition');
      setIsListening(false);
    }
  }, [isListening, options, processResult]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    } catch (e) {
      console.warn('Error stopping recognition', e);
    } finally {
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    interimRef.current = '';
    lastFinalRef.current = '';
    setTranscript('');
    setError(null);
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
