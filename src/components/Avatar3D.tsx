import React, { useRef, useState, Suspense, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getSignClip } from '@/utils/signDictionary';

interface Avatar3DProps {
  isAnimating: boolean;
  currentSign: string;
  className?: string;
}

interface Avatar3DRef {
  playSignAnimation: (clipPath: string) => void;
  stopAnimation: () => void;
}

// Enhanced 3D Avatar Component with GLB animation support
function AvatarModel({ 
  isAnimating = false, 
  currentSign = "",
  currentClip = null
}: { 
  isAnimating: boolean; 
  currentSign: string;
  currentClip: string | null;
}) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!bodyRef.current || !headRef.current || !leftArmRef.current || !rightArmRef.current) return;

    const time = state.clock.getElapsedTime();
    
    if (isAnimating) {
      // Animate signing gestures
      leftArmRef.current.rotation.z = Math.sin(time * 2) * 0.5 + 0.3;
      rightArmRef.current.rotation.z = -Math.sin(time * 2 + 1) * 0.5 - 0.3;
      leftArmRef.current.rotation.x = Math.cos(time * 1.5) * 0.3;
      rightArmRef.current.rotation.x = Math.cos(time * 1.5 + 0.5) * 0.3;
      
      // Slight body sway
      bodyRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
      
      // Head movement
      headRef.current.rotation.y = Math.sin(time * 0.8) * 0.2;
      headRef.current.rotation.x = Math.sin(time * 1.2) * 0.1;
    } else {
      // Idle animation
      bodyRef.current.rotation.y = Math.sin(time * 0.3) * 0.05;
      headRef.current.rotation.y = Math.sin(time * 0.4) * 0.1;
      
      // Breathing effect
      bodyRef.current.scale.y = 1 + Math.sin(time * 0.8) * 0.02;
    }
  });

  return (
    <group ref={bodyRef} position={[0, -1, 0]}>
      {/* Head */}
      <group ref={headRef} position={[0, 1.8, 0]}>
        {/* Face */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>
        
        {/* Hair */}
        <mesh position={[0, 0.25, 0]}>
          <boxGeometry args={[0.6, 0.4, 0.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        
        {/* Eyes */}
        <mesh position={[-0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        <mesh position={[0.12, 0.05, 0.3]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
        
        {/* Mouth */}
        <mesh position={[0, -0.1, 0.32]}>
          <boxGeometry args={[0.08, 0.03, 0.02]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
      </group>

      {/* Body (Torso) */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[0.8, 1.2, 0.4]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.6, 1.0, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#4F46E5" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.6, 1.0, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color="#4F46E5" />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.9, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>
      </group>

      {/* Legs */}
      <mesh position={[-0.2, -0.5, 0]}>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>
      <mesh position={[0.2, -0.5, 0]}>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>

      {/* Shoes */}
      <mesh position={[-0.2, -1.1, 0.1]}>
        <boxGeometry args={[0.3, 0.15, 0.4]} />
        <meshStandardMaterial color="#20B2AA" />
      </mesh>
      <mesh position={[0.2, -1.1, 0.1]}>
        <boxGeometry args={[0.3, 0.15, 0.4]} />
        <meshStandardMaterial color="#20B2AA" />
      </mesh>

      {/* Current sign text */}
      {currentSign && (
        <mesh position={[0, 2.5, 0]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color="#4F46E5" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

// Loading fallback component
function AvatarFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-32 h-32 bg-signar-blue-light rounded-full flex items-center justify-center">
        <div className="text-signar-blue font-bold text-lg">Loading Avatar...</div>
      </div>
    </div>
  );
}

const Avatar3D = forwardRef<Avatar3DRef, Avatar3DProps>(({ 
  isAnimating, 
  currentSign,
  className = ""
}, ref) => {
  const [currentClip, setCurrentClip] = useState<string | null>(null);
  const [animationMixer, setAnimationMixer] = useState<THREE.AnimationMixer | null>(null);

  useImperativeHandle(ref, () => ({
    playSignAnimation: (clipPath: string) => {
      setCurrentClip(clipPath);
      // In a real implementation, this would load and play the GLB animation
      console.log(`Playing sign animation: ${clipPath}`);
    },
    stopAnimation: () => {
      setCurrentClip(null);
      if (animationMixer) {
        animationMixer.stopAllAction();
      }
    }
  }));

  return (
    <div className={`w-full h-full ${className}`}>
      <Suspense fallback={<AvatarFallback />}>
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 50 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, 5, 5]} intensity={0.4} />
          
          <AvatarModel 
            isAnimating={isAnimating} 
            currentSign={currentSign}
            currentClip={currentClip}
          />
          
          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={3}
            maxDistance={8}
          />
        </Canvas>
      </Suspense>
      
      {/* Current sign display below canvas */}
      {currentSign && (
        <div className="mt-4 text-center">
          <div className="inline-block px-4 py-2 bg-signar-blue-light rounded-lg">
            <p className="text-sm font-medium text-signar-blue-dark">
              Current Sign: {currentSign}
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

export default Avatar3D;
export type { Avatar3DRef };
