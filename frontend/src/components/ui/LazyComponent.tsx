"use client";

import { Suspense, lazy, ReactNode, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

// Loading component for suspense fallback
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[200px] w-full">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
);

// Enhanced loading component with skeleton
const SkeletonLoader = ({ 
  type = "default",
  count = 1 
}: { 
  type?: "card" | "list" | "table" | "default";
  count?: number;
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case "card":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-lg h-48 w-full"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case "list":
        return (
          <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case "table":
        return (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex space-x-4 mb-2">
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
                <div className="h-6 bg-gray-200 rounded flex-1"></div>
              </div>
            ))}
          </div>
        );
      
      default:
        return <LoadingSpinner />;
    }
  };

  return (
    <div className="w-full p-4">
      {renderSkeleton()}
    </div>
  );
};

// Lazy wrapper component with enhanced loading states
interface LazyComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  skeletonType?: "card" | "list" | "table" | "default";
  skeletonCount?: number;
  loadingMessage?: string;
}

export function LazyWrapper({ 
  children, 
  fallback,
  skeletonType = "default",
  skeletonCount = 3,
  loadingMessage = "Loading..."
}: LazyComponentProps) {
  const defaultFallback = fallback || (
    <SkeletonLoader type={skeletonType} count={skeletonCount} />
  );

  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
}

// Higher-order component for lazy loading with prefetching
export function withLazyLoading<T extends Record<string, any>>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  options: {
    fallback?: ReactNode;
    skeletonType?: "card" | "list" | "table" | "default";
    skeletonCount?: number;
    loadingMessage?: string;
    prefetch?: boolean;
  } = {}
) {
  const {
    fallback,
    skeletonType = "default",
    skeletonCount = 3,
    loadingMessage = "Loading...",
    prefetch = false
  } = options;

  // Create lazy component
  const LazyComponent = lazy(importFunc);

  // Optional prefetching
  if (prefetch && typeof window !== 'undefined') {
    // Prefetch on idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc().catch(console.warn);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        importFunc().catch(console.warn);
      }, 100);
    }
  }

  return function WrappedComponent(props: T) {
    const defaultFallback = fallback || (
      <SkeletonLoader type={skeletonType} count={skeletonCount} />
    );

    return (
      <LazyWrapper
        fallback={defaultFallback}
        skeletonType={skeletonType}
        skeletonCount={skeletonCount}
        loadingMessage={loadingMessage}
      >
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Preload utility for manual component preloading
export const preloadComponent = (importFunc: () => Promise<any>) => {
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback for non-blocking preload
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFunc().catch(console.warn);
      });
    } else {
      setTimeout(() => {
        importFunc().catch(console.warn);
      }, 100);
    }
  }
};

// Hook for intersection observer based lazy loading
export const useIntersectionLoader = (
  ref: React.RefObject<HTMLElement>,
  importFunc: () => Promise<any>,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  if (typeof window !== 'undefined' && ref.current) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            importFunc().catch(console.warn);
            observer.unobserve(entry.target);
          }
        });
      },
      defaultOptions
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }
};

// Component registry for managing lazy components
class ComponentRegistry {
  private registry = new Map<string, () => Promise<any>>();
  private loaded = new Set<string>();

  register(name: string, importFunc: () => Promise<any>) {
    this.registry.set(name, importFunc);
  }

  preload(name: string) {
    const importFunc = this.registry.get(name);
    if (importFunc && !this.loaded.has(name)) {
      importFunc()
        .then(() => {
          this.loaded.add(name);
          console.log(`✅ Preloaded component: ${name}`);
        })
        .catch((error) => {
          console.warn(`⚠️ Failed to preload component ${name}:`, error);
        });
    }
  }

  preloadAll() {
    this.registry.forEach((importFunc, name) => {
      if (!this.loaded.has(name)) {
        this.preload(name);
      }
    });
  }

  isLoaded(name: string) {
    return this.loaded.has(name);
  }
}

export const componentRegistry = new ComponentRegistry();

// Auto-register common components
componentRegistry.register('ModelsPage', () => import('@/app/models/page'));
componentRegistry.register('DatasetsPage', () => import('@/app/datasets/page'));
componentRegistry.register('LeaderboardPage', () => import('@/app/leaderboard/page'));
componentRegistry.register('ProfilePage', () => import('@/app/profile/page'));
componentRegistry.register('AboutPage', () => import('@/app/about/page')); 