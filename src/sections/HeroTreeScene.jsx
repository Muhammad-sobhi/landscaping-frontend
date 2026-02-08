import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, useVideoTexture, Center, Float } from '@react-three/drei';
import * as THREE from 'three';

function VideoPortalText() {
  const textRef = useRef();
  // Using a high-quality local video
  const texture = useVideoTexture('/videos/hero.mp4');

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Subtle breathing effect for the text
    textRef.current.scale.x = 1 + Math.sin(t * 0.5) * 0.02;
    textRef.current.scale.y = 1 + Math.sin(t * 0.5) * 0.02;
  });

  return (
    <Center>
      <Text
        ref={textRef}
        fontSize={1.2}
        font="/fonts/Inter-Black.woff" // Use a very thick, heavy font
        letterSpacing={-0.05}
        lineHeight={0.8}
        textAlign="center"
      >
        {`THAT\nTREE\nGUY`}
        {/* This creates the "Mask" effect by applying the video as a map */}
        <meshBasicMaterial map={texture} toneMapped={false} />
      </Text>
    </Center>
  );
}

export default function HeroTreeScene() {
  return (
    <div className="h-screen w-full bg-[#0a0a0a] relative flex items-center justify-center">
      {/* Background Text for "Editorial" look */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-[20vw] font-black text-white/[0.02] leading-none select-none">
          ARBOR
        </h1>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 30 }}>
        <Suspense fallback={null}>
          <VideoPortalText />
        </Suspense>
      </Canvas>

      {/* Floating Info Labels - The "Premium" Touch */}
      <div className="absolute bottom-10 left-10 text-[10px] uppercase tracking-[0.3em] text-white/40 vertical-text">
        Modern Arboriculture / 2026
      </div>
    </div>
  );
}