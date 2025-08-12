import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  CameraOff, 
  Eye, 
  EyeOff, 
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SignRecognitionProps {
  onSignDetected?: (sign: string, confidence: number) => void;
  className?: string;
}

interface DetectedSign {
  word: string;
  confidence: number;
  timestamp: number;
}

const SignRecognition: React.FC<SignRecognitionProps> = ({ 
  onSignDetected, 
  className = "" 
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSign, setCurrentSign] = useState<DetectedSign | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<DetectedSign[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Placeholder sign prediction function - to be replaced with trained model
  const predictSign = useCallback(async (imageData: ImageData): Promise<DetectedSign | null> => {
    // Simulate model processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock prediction results for testing
    const mockSigns = [
      { word: 'hello', confidence: 0.95 },
      { word: 'thank', confidence: 0.88 },
      { word: 'you', confidence: 0.92 },
      { word: 'good', confidence: 0.85 },
      { word: 'morning', confidence: 0.79 },
      { word: 'help', confidence: 0.91 },
      { word: 'water', confidence: 0.87 },
      { word: 'food', confidence: 0.83 }
    ];

    // Randomly select a sign for demo purposes
    if (Math.random() > 0.7) { // 30% chance of detection
      const randomSign = mockSigns[Math.floor(Math.random() * mockSigns.length)];
      return {
        word: randomSign.word,
        confidence: randomSign.confidence,
        timestamp: Date.now()
      };
    }

    return null;
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsActive(true);
        
        toast({
          title: "Camera Started",
          description: "Sign recognition is now active"
        });

        // Start processing frames
        startProcessing();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown camera error';
      setCameraError(`Camera access failed: ${errorMessage}`);
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [toast]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
      processingIntervalRef.current = null;
    }

    setIsActive(false);
    setIsProcessing(false);
    setCurrentSign(null);
    
    toast({
      title: "Camera Stopped",
      description: "Sign recognition deactivated"
    });
  }, [toast]);

  // Start frame processing
  const startProcessing = useCallback(() => {
    if (processingIntervalRef.current) {
      clearInterval(processingIntervalRef.current);
    }

    processingIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !isActive) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context || video.readyState !== 4) return;

      try {
        setIsProcessing(true);

        // Draw video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Get image data for model processing
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        // Process frame with sign recognition model
        const detectedSign = await predictSign(imageData);

        if (detectedSign && detectedSign.confidence > 0.8) {
          setCurrentSign(detectedSign);
          
          // Add to history (limit to last 10)
          setDetectionHistory(prev => {
            const updated = [detectedSign, ...prev.slice(0, 9)];
            return updated;
          });

          // Notify parent component
          onSignDetected?.(detectedSign.word, detectedSign.confidence);

          toast({
            title: "Sign Detected!",
            description: `"${detectedSign.word}" (${Math.round(detectedSign.confidence * 100)}% confidence)`
          });
        }

      } catch (error) {
        console.error('Frame processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 1000); // Process every second
  }, [isActive, onSignDetected, predictSign, toast]);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isActive, startCamera, stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Camera Feed */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold">Live Sign Recognition</h4>
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Video Stream */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
              style={{ display: isActive ? 'block' : 'none' }}
            />
            
            {/* Hidden canvas for frame processing */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />

            {/* Placeholder when camera is off */}
            {!isActive && (
              <div className="w-full h-64 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Camera is off</p>
                </div>
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute top-2 right-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={toggleCamera}
              variant={isActive ? "destructive" : "default"}
              className="flex-1"
            >
              {isActive ? (
                <>
                  <CameraOff className="w-4 h-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>

            <Button variant="outline" size="icon" disabled={!isActive}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>

          {/* Error Display */}
          {cameraError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{cameraError}</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Current Detection */}
      {currentSign && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-primary">
                "{currentSign.word}"
              </h4>
              <p className="text-sm text-muted-foreground">
                Confidence: {Math.round(currentSign.confidence * 100)}%
              </p>
            </div>
            <CheckCircle className="w-6 h-6 text-green-500" />
          </div>
        </Card>
      )}

      {/* Detection History */}
      {detectionHistory.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Recent Detections</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {detectionHistory.map((detection, index) => (
              <div
                key={`${detection.timestamp}-${index}`}
                className="flex items-center justify-between text-sm p-2 bg-muted rounded"
              >
                <span className="font-medium">{detection.word}</span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(detection.confidence * 100)}%
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Model Info */}
      <Card className="p-4 bg-muted">
        <div className="text-center text-sm text-muted-foreground">
          <p className="font-medium mb-1">AI Model Status</p>
          <p>Demo Mode - Replace with trained ISL model</p>
          <p className="text-xs mt-2">
            Current: Mock predictions for testing
          </p>
        </div>
      </Card>
    </div>
  );
};

export default SignRecognition;