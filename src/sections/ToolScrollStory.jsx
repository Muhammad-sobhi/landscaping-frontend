import React from 'react';

export default function ToolScrollStory() {
  return (
    <section className="bg-white text-black py-32 px-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-end gap-20">
        <div className="md:w-1/2">
          <span className="text-xs uppercase tracking-widest font-bold text-green-700">The Aesthetic</span>
          <h2 className="text-6xl md:text-8xl font-black leading-[0.85] mt-4 tracking-tighter">
            SURGICAL <br /> PRECISION.
          </h2>
        </div>
        <div className="md:w-1/2">
          <p className="text-2xl text-gray-800 font-medium leading-tight mb-10">
            We treat your landscape like a living sculpture. No jagged edges, no mess—just the architecture of nature.
          </p>
          <div className="aspect-video w-full bg-gray-100 rounded-sm overflow-hidden relative group">
             <img 
               src="/images/precision-cut.jpg" 
               className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
               alt="Precision Cutting"
             />
          </div>
        </div>
      </div>
    </section>
  );
}