import { MathUtils } from 'three';

// Optimized wind math: returns a value between -1 and 1
export const getWindSway = (state) => {
  const t = state.clock.getElapsedTime();
  // Very slow, heavy movement
  return Math.sin(t * 0.3) * 0.02;
};