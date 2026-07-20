// src/components/SignRecognition.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CameraOff, Volume2, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api';

// --- Sequence capture parameters ---
// One "sign attempt" = SEQ_FRAMES frames captured over ~2 seconds,
// classified in a single request by the temporal model (or the CNN
// majority-vote fallback if the temporal model isn't trained yet).
const SEQ_FRAMES = 30;
const FRAME_INTERVAL_MS = 66;      // ~15 fps -> 30 frames ≈ 2s
const MIN_CONFIDENCE = 0.7;        // sequence-level acceptance threshold
const JPEG_QUALITY = 0.6;

export default function SignRecognition() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'capturing' | 'predicting'>('idle');
  const [livePrediction, setLivePrediction] = useState<string>('');
  const [stableWord, setStableWord] = useState<string>('');
  const [sentence, setSentence] = useState<string[]>([]);
  const [modelUsed, setModelUsed] = useState<string>('');

  const camRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef(false);
  const lastSpokenRef = useRef<string>('');

  const speak = useCallback(async (word: string) => {
    try {
      const res = await fetch(API_ENDPOINTS.SPEAK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: word }),
      });
      const data = await res.json();
      if (data.audio && audioRef.current) {
        audioRef.current.src = 'data:audio/mpeg;base64,' + data.audio;
        audioRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('TTS error:', err);
    }
  }, []);

  /** Grab one JPEG blob from the webcam. */
  const grabFrame = useCallback((): Promise<Blob | null> => {
    const vid = camRef.current;
    if (!vid || vid.videoWidth === 0) return Promise.resolve(null);
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth;
    canvas.height = vid.videoHeight;
    canvas.getContext('2d')?.drawImage(vid, 0, 0);
    return new Promise(resolve => canvas.toBlob(b => resolve(b), 'image/jpeg', JPEG_QUALITY));
  }, []);

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  /** Capture a burst of frames, send them as one sequence, repeat while running. */
  const captureLoop = useCallback(async () => {
    while (runningRef.current) {
      // --- 1. Capture ~2s of frames ---
      setPhase('capturing');
      const frames: Blob[] = [];
      for (let i = 0; i < SEQ_FRAMES && runningRef.current; i++) {
        const blob = await grabFrame();
        if (blob) frames.push(blob);
        await sleep(FRAME_INTERVAL_MS);
      }
      if (!runningRef.current || frames.length < SEQ_FRAMES / 2) break;

      // --- 2. Classify the whole sequence ---
      setPhase('predicting');
      const formData = new FormData();
      frames.forEach((b, i) => formData.append('frames', b, `f${i}.jpg`));

      try {
        const res = await fetch(API_ENDPOINTS.PREDICT_SEQUENCE, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.prediction) {
          setLivePrediction(`${data.prediction} (${data.confidence.toFixed(2)})`);
          setModelUsed(data.model || '');
          if (data.confidence >= MIN_CONFIDENCE && data.prediction !== lastSpokenRef.current) {
            lastSpokenRef.current = data.prediction;
            setStableWord(data.prediction);
            setSentence(prev => [...prev, data.prediction]);
            speak(data.prediction);
          }
        } else {
          setLivePrediction('No sign detected');
        }
      } catch (err) {
        console.error('Sequence prediction error:', err);
      }
    }
    setPhase('idle');
  }, [grabFrame, speak]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (camRef.current) camRef.current.srcObject = stream;
      lastSpokenRef.current = '';
      setSentence([]);
      setStableWord('');
      setLivePrediction('');
      runningRef.current = true;
      setRunning(true);
      captureLoop();
    } catch (err) {
      console.error('Could not access camera:', err);
    }
  }, [captureLoop]);

  const stop = useCallback(() => {
    runningRef.current = false;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (camRef.current) camRef.current.srcObject = null;
    setRunning(false);
    setPhase('idle');
  }, []);

  // Clean up on unmount
  useEffect(() => stop, [stop]);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sign Recognition</h3>
        {modelUsed && (
          <Badge variant={modelUsed === 'temporal' ? 'default' : 'outline'}>
            {modelUsed === 'temporal' ? 'Temporal LSTM' : 'CNN fallback'}
          </Badge>
        )}
      </div>

      <video
        ref={camRef}
        autoPlay
        playsInline
        muted
        className="w-full max-w-md rounded-lg shadow mb-4 bg-muted"
      />

      <div className="space-y-2 mb-4">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          {phase === 'capturing' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
          {phase === 'predicting' && <Loader2 className="w-3 h-3 animate-spin" />}
          {phase === 'capturing' && 'Recording sign… keep signing'}
          {phase === 'predicting' && 'Analyzing…'}
          {phase === 'idle' && (livePrediction || 'Camera off')}
        </p>
        {phase !== 'idle' && livePrediction && (
          <p className="text-sm">Last: {livePrediction}</p>
        )}
        {stableWord && (
          <p className="flex items-center gap-2 text-foreground font-semibold">
            <Volume2 className="w-4 h-4" /> {stableWord}
          </p>
        )}
        {sentence.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {sentence.map((w, i) => (
              <Badge key={i} variant="secondary">{w}</Badge>
            ))}
          </div>
        )}
      </div>

      <audio ref={audioRef} className="hidden" />

      <div className="flex items-center gap-2">
        <button
          onClick={running ? stop : start}
          className={`px-4 py-2 rounded-lg shadow text-white flex items-center gap-2 ${
            running ? 'bg-red-500' : 'bg-signlang-blue'
          }`}
        >
          {running ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
          {running ? 'Stop Recognition' : 'Start Recognition'}
        </button>
        {sentence.length > 0 && (
          <button
            onClick={() => { setSentence([]); lastSpokenRef.current = ''; }}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {/* Single-image upload (one-shot per-frame CNN prediction) */}
      <div className="mt-6 border-t pt-4">
        <p className="text-sm text-muted-foreground mb-2">Or upload an image:</p>
        <input
          type="file"
          accept="image/*"
          onChange={async e => {
            const file = e.target.files?.[0];
            if (!file) return;
            const formData = new FormData();
            formData.append('frame', file);
            try {
              const res = await fetch(API_ENDPOINTS.PREDICT, { method: 'POST', body: formData });
              const data = await res.json();
              if (data.prediction) {
                setLivePrediction(`${data.prediction} (${data.confidence.toFixed(2)})`);
                if (data.confidence >= 0.6) {
                  setStableWord(data.prediction);
                  speak(data.prediction);
                }
              }
            } catch (err) {
              console.error('Prediction error:', err);
            }
          }}
        />
      </div>
    </Card>
  );
}
