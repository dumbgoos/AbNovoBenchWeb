"use client";

import { useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// Route preloading configuration
const PRELOAD_ROUTES = [
  '/models',
  '/datasets',
  '/leaderboard',
  '/submit',
  '/profile',
  '/about'
];

// Critical data endpoints for prefetching
const CRITICAL_ENDPOINTS = [
  '/api/models',
  '/api/datasets',
  '/api/leaderboard',
  '/api/health'
];

interface RoutePreloaderProps {
  children: ReactNode;
}

export function RoutePreloader({ children }: RoutePreloaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Prefetch critical routes on app load
  const prefetchRoutes = useCallback(async () => {
    try {
      // Use Next.js built-in prefetching
      PRELOAD_ROUTES.forEach(route => {
        router.prefetch(route);
      });
      
      console.log('✅ Routes prefetched successfully');
    } catch (error) {
      console.warn('⚠️ Route prefetching failed:', error);
    }
  }, [router]);

  // Prefetch critical data
  const prefetchData = useCallback(async () => {
    try {
      // Prefetch critical API endpoints
      const prefetchPromises = CRITICAL_ENDPOINTS.map(async endpoint => {
        try {
          const response = await fetch(endpoint, {
            method: 'HEAD', // Use HEAD request to minimize data transfer
            headers: {
              'Cache-Control': 'max-age=300, stale-while-revalidate=600',
            },
          });
          
          if (response.ok) {
            console.log(`✅ Prefetched: ${endpoint}`);
          }
        } catch (error) {
          console.warn(`⚠️ Failed to prefetch ${endpoint}:`, error);
        }
      });

      await Promise.allSettled(prefetchPromises);
    } catch (error) {
      console.warn('⚠️ Data prefetching failed:', error);
    }
  }, []);

  // Initialize preloading on mount
  useEffect(() => {
    // Delay prefetching to avoid blocking initial render
    const timer = setTimeout(() => {
      prefetchRoutes();
      prefetchData();
    }, 100);

    return () => clearTimeout(timer);
  }, [prefetchRoutes, prefetchData]);

  // Prefetch adjacent routes based on current page
  useEffect(() => {
    const prefetchAdjacentRoutes = () => {
      const routeGraph: Record<string, string[]> = {
        '/': ['/auth/login', '/leaderboard', '/models', '/submit'],
        '/auth/login': ['/profile', '/admin'],
        '/auth/register': ['/profile'],
        '/leaderboard': ['/models', '/submit', '/profile'],
        '/models': ['/leaderboard', '/submit', '/profile'],
        '/submit': ['/models', '/profile'],
        '/admin': ['/profile', '/models', '/leaderboard'],
        '/profile': ['/submit', '/models', '/leaderboard'],
      };

      const adjacentRoutes = routeGraph[pathname] || [];
      adjacentRoutes.forEach(route => {
        router.prefetch(route);
      });
    };

    prefetchAdjacentRoutes();
  }, [pathname, router]);

  return <>{children}</>;
}

// Utility hook for manual prefetching
export const useRoutePrefetch = () => {
  const router = useRouter();

  const prefetchRoute = useCallback((route: string) => {
    router.prefetch(route);
  }, [router]);

  const prefetchData = useCallback(async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'max-age=300, stale-while-revalidate=600',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.warn(`Failed to prefetch ${endpoint}:`, error);
      return false;
    }
  }, []);

  return {
    prefetchRoute,
    prefetchData
  };
};

// Performance monitoring utilities
export const performanceMonitor = {
  // Track route transition times
  trackRouteTransition: (fromRoute: string, toRoute: string, startTime: number) => {
    const duration = Date.now() - startTime;
    console.log(`🚀 Route transition: ${fromRoute} → ${toRoute} (${duration}ms)`);
    
    // Store performance metrics
    if (typeof window !== 'undefined') {
      const metrics = JSON.parse(localStorage.getItem('route-metrics') || '{}');
      const key = `${fromRoute}-${toRoute}`;
      metrics[key] = {
        duration,
        timestamp: Date.now(),
        count: (metrics[key]?.count || 0) + 1
      };
      localStorage.setItem('route-metrics', JSON.stringify(metrics));
    }
  },

  // Get performance metrics
  getMetrics: () => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('route-metrics') || '{}');
    }
    return {};
  },

  // Clear performance metrics
  clearMetrics: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('route-metrics');
    }
  }
};

// Cache utilities for data persistence
export const cacheUtils = {
  // Set cache with expiration
  setCache: (key: string, data: any, ttl: number = 300000) => { // 5 minutes default
    if (typeof window !== 'undefined') {
      const cacheItem = {
        data,
        timestamp: Date.now(),
        ttl
      };
      localStorage.setItem(`cache:${key}`, JSON.stringify(cacheItem));
    }
  },

  // Get cache if not expired
  getCache: (key: string) => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(`cache:${key}`);
        if (cached) {
          const { data, timestamp, ttl } = JSON.parse(cached);
          if (Date.now() - timestamp < ttl) {
            return data;
          }
          // Remove expired cache
          localStorage.removeItem(`cache:${key}`);
        }
      } catch (error) {
        console.warn(`Failed to get cache for ${key}:`, error);
      }
    }
    return null;
  },

  // Clear specific cache
  clearCache: (key: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`cache:${key}`);
    }
  },

  // Clear all cache
  clearAllCache: () => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cache:')) {
          localStorage.removeItem(key);
        }
      });
    }
  }
}; 