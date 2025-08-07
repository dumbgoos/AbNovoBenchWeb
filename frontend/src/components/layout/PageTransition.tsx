"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Start transition immediately
    setIsTransitioning(true);
    
    // Use requestAnimationFrame for smooth transition
    const frame = requestAnimationFrame(() => {
      setIsTransitioning(false);
    });

    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <div className={`transition-opacity duration-75 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
      {children}
    </div>
  );
}

export function StaggeredFadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transform transition-all duration-300 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  );
} 