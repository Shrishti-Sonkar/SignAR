import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Avatar3DProps {
  isAnimating?: boolean;
  currentSign?: string;
  className?: string;
}

// Simple 3D Avatar Component (cartoon-style like the reference image)
function AvatarModel({ isAnimating = false, currentSign = "" }: { isAnimating: boolean; currentSign: string }) {
  const bodyRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  
  const [animationPhase, setAnimationPhase] = useState(0);

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
        <Sphere args={[0.35]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
        
        {/* Hair */}
        <Box args={[0.6, 0.4, 0.5]} position={[0, 0.25, 0]}>
          <meshStandardMaterial color="#8B4513" />
        </Box>
        
        {/* Eyes */}
        <Sphere args={[0.05]} position={[-0.12, 0.05, 0.3]}>
          <meshStandardMaterial color="#000" />
        </Sphere>
        <Sphere args={[0.05]} position={[0.12, 0.05, 0.3]}>
          <meshStandardMaterial color="#000" />
        </Sphere>
        
        {/* Mouth */}
        <Box args={[0.08, 0.03, 0.02]} position={[0, -0.1, 0.32]}>
          <meshStandardMaterial color="#FF6B6B" />
        </Box>
      </group>

      {/* Body (Torso) */}
      <Box args={[0.8, 1.2, 0.4]} position={[0, 0.6, 0]}>
        <meshStandardMaterial color="#4F46E5" />
      </Box>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.6, 1.0, 0]}>
        <Box args={[0.15, 0.8, 0.15]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#4F46E5" />
        </Box>
        {/* Hand */}
        <Sphere args={[0.12]} position={[0, -0.9, 0]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
      </group>

      <group ref={rightArmRef} position={[0.6, 1.0, 0]}>
        <Box args={[0.15, 0.8, 0.15]} position={[0, -0.4, 0]}>
          <meshStandardMaterial color="#4F46E5" />
        </Box>
        {/* Hand */}
        <Sphere args={[0.12]} position={[0, -0.9, 0]}>
          <meshStandardMaterial color="#FDBCB4" />
        </Sphere>
      </group>

      {/* Legs */}
      <Box args={[0.2, 1.0, 0.2]} position={[-0.2, -0.5, 0]}>
        <meshStandardMaterial color="#4F46E5" />
      </Box>
      <Box args={[0.2, 1.0, 0.2]} position={[0.2, -0.5, 0]}>
        <meshStandardMaterial color="#4F46E5" />
      </Box>

      {/* Shoes */}
      <Box args={[0.3, 0.15, 0.4]} position={[-0.2, -1.1, 0.1]}>
        <meshStandardMaterial color="#20B2AA" />
      </Box>
      <Box args={[0.3, 0.15, 0.4]} position={[0.2, -1.1, 0.1]}>
        <meshStandardMaterial color="#20B2AA" />
      </Box>

      {/* Current sign text */}
      {currentSign && (
        <Text
          position={[0, 2.5, 0]}
          fontSize={0.3}
          color="#4F46E5"
          anchorX="center"
          anchorY="middle"
        >
          {currentSign}
        </Text>
      )}
    </group>
  );
}

const Avatar3D: React.FC<Avatar3DProps> = ({ 
  isAnimating = false, 
  currentSign = "",
  className = ""
}) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, 5, 5]} intensity={0.4} />
        
        <AvatarModel isAnimating={isAnimating} currentSign={currentSign} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={3}
          maxDistance={8}
        />
      </Canvas>
    </div>
  );
};

export default Avatar3D;