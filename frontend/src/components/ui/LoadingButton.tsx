"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface LoadingButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  loadingText?: string;
  delay?: number;
  showSpinner?: boolean;
}

export function LoadingButton({ 
  href, 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  loadingText = "Loading...",
  delay = 300,
  showSpinner = true
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Add a small delay to show loading state
    setTimeout(() => {
      router.push(href);
    }, delay);
  };

  // Reset loading state when component unmounts or route changes
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={cn(
        "loading-button transition-all duration-300",
        isLoading && "loading",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          {showSpinner && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <span className="loading-text">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}

// Alternative version using Link with loading state
export function LoadingLink({ 
  href, 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  loadingText = "Loading...",
  delay = 200,
  showSpinner = true
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    
    // Reset loading state after navigation
    setTimeout(() => {
      setIsLoading(false);
    }, delay + 1000);
  };

  return (
    <Button 
      asChild={!isLoading}
      variant={variant} 
      size={size} 
      className={cn(
        "loading-button transition-all duration-300",
        isLoading && "loading",
        className
      )}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="flex items-center">
          {showSpinner && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <span className="loading-text">{loadingText}</span>
        </span>
      ) : (
        <Link href={href} onClick={handleClick}>
          {children}
        </Link>
      )}
    </Button>
  );
}

// Enhanced version with progress indicator
export function LoadingLinkWithProgress({ 
  href, 
  children, 
  variant = "default", 
  size = "default", 
  className = "",
  loadingText = "Loading...",
  delay = 200
}: LoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = () => {
    setIsLoading(true);
    setProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, delay / 10);
    
    // Navigate after delay
    setTimeout(() => {
      setProgress(100);
      clearInterval(interval);
      window.location.href = href;
    }, delay);
  };

  return (
    <Button 
      variant={variant} 
      size={size} 
      className={cn(
        "loading-button relative overflow-hidden transition-all duration-300",
        isLoading && "loading",
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      )}
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span className="loading-text">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
} 