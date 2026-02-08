import React from 'react';
import HeroTreeScene from '../sections/HeroTreeScene';
import ToolScrollStory from '../sections/ToolScrollStory';
import PlanetYourRequest from '../sections/PlanetYourRequest';

const Landing = () => {
  return (
    <main className="bg-black font-sans text-white w-full">
      <HeroTreeScene />
      <ToolScrollStory />
      <section className="py-32 px-6 border-t border-white/5">
        <PlanetYourRequest />
      </section>
      <footer className="py-12 text-center text-gray-500 text-[10px] uppercase tracking-[0.5em]">
        © 2026 That Tree Guy | Professional Tree Services
      </footer>
    </main>
  );
};

export default Landing;