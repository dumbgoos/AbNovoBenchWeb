"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LoadingLink } from '@/components/ui/LoadingButton';
import { AnimatedSection, FloatingElement } from '@/components/home/ScrollAnimations';
import { 
  MagneticHover, 
  ParticleBackground, 
  TypewriterEffect, 
  GlowEffect 
} from '@/components/ui/AnimatedComponents';
import { smoothScrollTo } from '@/components/ui/ScrollEnhancer';

export function Hero() {
  // Smooth scroll to next section
  const scrollToNextSection = () => {
    smoothScrollTo('about-section', 80);
  };

  // Handle mouse wheel scroll with simplified logic
  useEffect(() => {
    let isScrolling = false;

    const handleWheel = (e: Event) => {
      // Prevent multiple rapid scroll triggers
      if (isScrolling) return;
      
      const wheelEvent = e as WheelEvent;
      const heroSection = document.querySelector('#hero-section');
      
      if (heroSection && wheelEvent.deltaY > 50) { // Require significant scroll
        const rect = heroSection.getBoundingClientRect();
        // Only trigger when scrolling down in the hero section
        if (rect.top <= 0 && rect.bottom > window.innerHeight * 0.3) {
          isScrolling = true;
          
          // Simple timeout to prevent rapid triggers
          setTimeout(() => {
            scrollToNextSection();
            setTimeout(() => {
              isScrolling = false;
            }, 1000);
          }, 100);
        }
      }
    };

    const heroSection = document.querySelector('#hero-section');
    if (heroSection) {
      heroSection.addEventListener('wheel', handleWheel, { passive: true });
    }

    return () => {
      if (heroSection) {
        heroSection.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <section id="hero-section" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#5f57d3] via-[#4a51be] to-[#667eea]">
      {/* Particle Background */}
      <ParticleBackground className="absolute inset-0 z-0" />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/20 z-10"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <FloatingElement amplitude={20} duration={6} className="absolute top-20 left-[10%]">
          <div className="w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
        </FloatingElement>
        <FloatingElement amplitude={15} duration={4} className="absolute top-40 right-[15%]">
          <div className="w-12 h-12 bg-white/10 rounded-full blur-sm"></div>
        </FloatingElement>
        <FloatingElement amplitude={25} duration={8} className="absolute bottom-40 left-[20%]">
          <div className="w-20 h-20 bg-white/10 rounded-full blur-sm"></div>
        </FloatingElement>
      </div>

      {/* Scientific Symbols */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <FloatingElement amplitude={10} duration={5} className="absolute top-[20%] left-[15%]">
          <span className="text-2xl text-white/30">🧬</span>
        </FloatingElement>
        <FloatingElement amplitude={12} duration={7} className="absolute top-[30%] right-[20%]">
          <span className="text-2xl text-white/30">⚗️</span>
        </FloatingElement>
        <FloatingElement amplitude={8} duration={6} className="absolute bottom-[30%] left-[25%]">
          <span className="text-2xl text-white/30">🔬</span>
        </FloatingElement>
        <FloatingElement amplitude={15} duration={4} className="absolute bottom-[40%] right-[30%]">
          <span className="text-2xl text-white/30">🧪</span>
        </FloatingElement>
      </div>

      {/* Main Content */}
      <div className="relative z-30 text-center text-white px-4 max-w-6xl mx-auto">
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <TypewriterEffect 
                texts={[
                  "AbNovoBench",
                  "Antibody Sequencing",
                  "Proteomics Analysis"
                ]}
                className="gradient-text-hero"
              />
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
              The comprehensive benchmarking platform for antibody de novo sequencing.
            </p>
          </div>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <MagneticHover>
              <GlowEffect color="blue" className="rounded-full">
                <LoadingLink 
                  href="/leaderboard" 
                  variant="outline" 
                  size="lg" 
                  className="btn-unified px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 morph-button"
                  loadingText="Loading..."
                >
                  View Leaderboard
                </LoadingLink>
              </GlowEffect>
            </MagneticHover>
            <MagneticHover>
              <GlowEffect color="blue" className="rounded-full">
                <LoadingLink 
                  href="/about" 
                  variant="outline" 
                  size="lg" 
                  className="btn-unified px-8 py-4 text-lg rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 morph-button"
                  loadingText="Loading..."
                >
                  Learn More
                </LoadingLink>
              </GlowEffect>
            </MagneticHover>
          </div>
          
          {/* Scroll Down Arrow */}
          <div className="mt-16 flex justify-center">
            <button 
              onClick={scrollToNextSection}
              className="scroll-down-arrow group cursor-pointer animate-bounce hover:animate-none transition-transform duration-300 transform hover:scale-110"
              aria-label="Scroll to next section"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 border border-white/30 group-hover:border-white/50 group-hover:bg-white/30 transition-all duration-300 shadow-lg">
                <svg 
                  className="w-6 h-6 text-white transition-colors duration-300" 
                  fill="none" 
                  stroke="white" 
                  viewBox="0 0 24 24"
                  style={{ color: 'white' }}
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 14l-7 7m0 0l-7-7m7 7V3" 
                    stroke="white"
                  />
                </svg>
              </div>
            </button>
          </div>
        </AnimatedSection>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none z-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>
    </section>
  );
}
