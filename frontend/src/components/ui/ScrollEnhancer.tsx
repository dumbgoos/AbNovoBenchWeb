"use client";

import React, { useEffect, useState } from 'react';

interface ScrollEnhancerProps {
  children: React.ReactNode;
}

export function ScrollEnhancer({ children }: ScrollEnhancerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      // Calculate scroll progress
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      
      setScrollProgress(scrollPercent);
      setIsScrolling(true);

      // Clear existing timeout
      clearTimeout(scrollTimeout);
      
      // Set timeout to hide scroll indicator
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className="relative">
      {/* Scroll Progress Indicator */}
      <div 
        className={`fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-50 transition-opacity duration-300 ${
          isScrolling ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* Scroll Position Indicator */}
      <div 
        className={`fixed right-4 top-1/2 transform -translate-y-1/2 z-40 transition-opacity duration-300 ${
          isScrolling ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="w-2 h-32 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ height: `${scrollProgress}%` }}
          />
        </div>
      </div>

      {children}
    </div>
  );
}

// Smooth scroll utility function with native smooth scrolling
export const smoothScrollTo = (elementId: string, offset: number = 0) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;

  // Use native smooth scrolling for better performance
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

// Section transition component
interface SectionTransitionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SectionTransition({ children, className = '', delay = 0 }: SectionTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`transition-all duration-1000 ${
        isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-10'
      } ${className}`}
    >
      {children}
    </div>
  );
} 