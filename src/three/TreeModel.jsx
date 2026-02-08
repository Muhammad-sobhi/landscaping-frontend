import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function TreeModel({ position }) {
  const shadowRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Organic "Swaying Shadow" movement
    shadowRef.current.position.x = position[0] + Math.sin(t * 0.2) * 0.5;
  });

  return (
    <mesh ref={shadowRef} position={position} rotation={[0, 0, Math.PI / 8]}>
      <planeGeometry args={[4, 10]} />
      {/* A semi-transparent gradient that looks like a tree shadow */}
      <meshBasicMaterial 
        color="#000000" 
        transparent 
        opacity={0.4} 
        side={2}
      />
    </mesh>
  );
}