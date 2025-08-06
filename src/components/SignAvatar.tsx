import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Html } from '@react-three/drei';
import { AnimationMixer, Group, LoopOnce } from 'three';
import * as THREE from 'three';

// Types for the avatar handle
export interface SignAvatarHandle {
  playSignClip(path: string): Promise<void>;
  playRealTimeGesture(glosses: string[]): Promise<void>;
}

interface SignAvatarProps {
  className?: string;
  currentSign?: string;
  isAnimating?: boolean;
}

// Main Avatar Model Component
const AvatarModel = ({ 
  onAnimationReady, 
  animationPath, 
  glosses,
  isRealTime 
}: {
  onAnimationReady: (mixer: AnimationMixer | null) => void;
  animationPath?: string;
  glosses?: string[];
  isRealTime?: boolean;
}) => {
  const group = useRef<Group>(null);
  const [currentGlossIndex, setCurrentGlossIndex] = useState(0);
  
  // Load the main rigged avatar
  const { scene, animations } = useGLTF('/avatar/avatar.glb');
  const { mixer, actions } = useAnimations(animations, group);

  // Load individual animation clips using useGLTF instead
  const animationGLTF = animationPath ? useGLTF(animationPath) : null;

  useEffect(() => {
    if (mixer) {
      onAnimationReady(mixer);
    }
  }, [mixer, onAnimationReady]);

  // Handle local clip playback
  useEffect(() => {
    if (animationGLTF && mixer && !isRealTime) {
      // Clear previous animations
      mixer.stopAllAction();
      
      if (animationGLTF.animations.length > 0) {
        const action = mixer.clipAction(animationGLTF.animations[0]);
        action.reset();
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.play();
      }
    }
  }, [animationGLTF, mixer, isRealTime]);

  // Handle real-time gesture playback
  useEffect(() => {
    if (isRealTime && glosses && glosses.length > 0 && mixer) {
      const playNextGloss = async () => {
        if (currentGlossIndex < glosses.length) {
          const gloss = glosses[currentGlossIndex];
          
          try {
            // Simulate API call for real-time gesture generation
            const response = await fetch('/api/generate-sign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ gloss })
            });
            
            if (response.ok) {
              const gestureData = await response.json();
              // Apply gesture data to avatar (this would be implemented based on your API response format)
              console.log(`Playing gesture for: ${gloss}`, gestureData);
            }
          } catch (error) {
            console.warn(`Failed to generate gesture for: ${gloss}`, error);
          }
          
          // Move to next gloss after delay
          setTimeout(() => {
            setCurrentGlossIndex(prev => prev + 1);
          }, 2000); // 2 seconds per gloss
        }
      };

      playNextGloss();
    }
  }, [isRealTime, glosses, currentGlossIndex, mixer]);

  // Reset gloss index when new glosses are provided
  useEffect(() => {
    if (glosses) {
      setCurrentGlossIndex(0);
    }
  }, [glosses]);

  // Basic idle animation when not playing signs
  useFrame((state) => {
    if (group.current && !animationPath && !isRealTime) {
      // Subtle breathing/idle movement
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.01;
    }
  });

  return (
    <group ref={group} position={[0, -1, 0]}>
      <primitive object={scene.clone()} scale={[1, 1, 1]} />
    </group>
  );
};

// Fallback component when avatar is loading
const AvatarFallback = () => (
  <Html center>
    <div className="flex flex-col items-center space-y-2 p-4 bg-background/80 backdrop-blur-sm rounded-lg border">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading Avatar...</p>
    </div>
  </Html>
);

// Main SignAvatar component
export const SignAvatar = forwardRef<SignAvatarHandle, SignAvatarProps>(
  ({ className = "", currentSign, isAnimating }, ref) => {
    const [mixer, setMixer] = useState<AnimationMixer | null>(null);
    const [currentAnimationPath, setCurrentAnimationPath] = useState<string>();
    const [currentGlosses, setCurrentGlosses] = useState<string[]>();
    const [isRealTimeMode, setIsRealTimeMode] = useState(false);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      async playSignClip(path: string): Promise<void> {
        return new Promise((resolve) => {
          setIsRealTimeMode(false);
          setCurrentGlosses(undefined);
          setCurrentAnimationPath(path);
          
          // Resolve after animation setup
          setTimeout(resolve, 100);
        });
      },

      async playRealTimeGesture(glosses: string[]): Promise<void> {
        return new Promise((resolve) => {
          setCurrentAnimationPath(undefined);
          setIsRealTimeMode(true);
          setCurrentGlosses(glosses);
          
          // Resolve after gesture sequence setup
          setTimeout(resolve, glosses.length * 2000 + 500);
        });
      }
    }), []);

    // Update mixer animation clock
    useFrame(() => {
      if (mixer) {
        mixer.update(0.016); // ~60fps
      }
    });

    return (
      <div className={`relative w-full h-96 ${className}`}>
        <Canvas
          camera={{ position: [0, 1, 3], fov: 50 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          shadows
        >
          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-5, 5, 5]} intensity={0.5} />

          {/* Camera controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI * 0.2}
            maxPolarAngle={Math.PI * 0.8}
          />

          {/* Avatar model */}
          <React.Suspense fallback={<AvatarFallback />}>
            <AvatarModel
              onAnimationReady={setMixer}
              animationPath={currentAnimationPath}
              glosses={currentGlosses}
              isRealTime={isRealTimeMode}
            />
          </React.Suspense>

          {/* Ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
        </Canvas>

        {/* Current sign display */}
        {currentSign && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/90 backdrop-blur-sm border rounded-lg px-4 py-2">
            <p className="text-sm font-medium text-foreground">
              Current Sign: <span className="text-primary">{currentSign}</span>
            </p>
          </div>
        )}

        {/* Animation status indicator */}
        {isAnimating && (
          <div className="absolute top-4 right-4 flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs text-primary font-medium">Animating</span>
          </div>
        )}

        {/* Real-time mode indicator */}
        {isRealTimeMode && currentGlosses && (
          <div className="absolute top-4 left-4 bg-accent/10 border border-accent/20 rounded-lg px-3 py-2">
            <p className="text-xs text-accent font-medium">
              Real-time Mode: {currentGlosses.length} gestures
            </p>
          </div>
        )}
      </div>
    );
  }
);

SignAvatar.displayName = 'SignAvatar';

// Preload the avatar model
useGLTF.preload('/avatar/avatar.glb');

export default SignAvatar;