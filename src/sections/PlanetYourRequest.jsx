import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { motion } from 'framer-motion';

const PlanetYourRequest = () => {
  // PlanetYourRequest.jsx logic hint
const [step, setStep] = React.useState(1);

return (
  <div className="flex flex-col md:flex-row items-center justify-between min-h-[600px] gap-10">
    {/* Left Side: The "Nature Planet" */}
    <div className="w-full md:w-1/2 h-[400px]">
       <Canvas>
          <Float speed={3}>
             <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial 
                  emissive="#15803d" 
                  emissiveIntensity={0.2} 
                  wireframe // Makes it look "Architectural/Drawn"
                />
             </mesh>
          </Float>
       </Canvas>
    </div>

    {/* Right Side: The Glass Form */}
    <motion.div 
      key={step}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-1/2 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
    >
      <h2 className="text-3xl font-serif mb-6 italic text-green-500">Begin Your Project</h2>
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-gray-400">What is the focus of your request?</p>
          <button onClick={() => setStep(2)} className="w-full text-left p-4 border border-white/20 hover:bg-green-600 hover:text-black transition-all">
             01. Precision Tree Removal
          </button>
          <button onClick={() => setStep(2)} className="w-full text-left p-4 border border-white/20 hover:bg-green-600 hover:text-black transition-all">
             02. Aesthetic Pruning
          </button>
        </div>
      )}
    </motion.div>
  </div>
);
};

export default PlanetYourRequest;