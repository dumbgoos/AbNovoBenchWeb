"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheUtils } from '@/components/providers/RoutePreloader';

interface UseOptimizedDataOptions {
  // Cache options
  cacheKey?: string;
  cacheTTL?: number; // Time to live in milliseconds
  
  // Fetching options
  retryCount?: number;
  retryDelay?: number;
  
  // Loading states
  initialData?: any;
  loadingDelay?: number;
  
  // Background refresh
  backgroundRefresh?: boolean;
  refreshInterval?: number;
  
  // Error handling
  fallbackData?: any;
  onError?: (error: Error) => void;
  
  // Dependencies
  dependencies?: any[];
}

interface UseOptimizedDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  prefetch: () => Promise<void>;
  clearCache: () => void;
  isStale: boolean;
  lastUpdated: number | null;
}

export function useOptimizedData<T = any>(
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions = {}
): UseOptimizedDataResult<T> {
  const {
    cacheKey,
    cacheTTL = 300000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000,
    initialData = null,
    loadingDelay = 0,
    backgroundRefresh = true,
    refreshInterval = 600000, // 10 minutes default
    fallbackData = null,
    onError,
    dependencies = []
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
  }, []);

  // Fetch data with retry logic
  const fetchWithRetry = useCallback(async (
    attempt: number = 0,
    signal?: AbortSignal
  ): Promise<T> => {
    try {
      const result = await fetcher();
      return result;
    } catch (err) {
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }
      
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        return fetchWithRetry(attempt + 1, signal);
      }
      
      throw err;
    }
  }, [fetcher, retryCount, retryDelay]);

  // Main fetch function
  const fetchData = useCallback(async (
    options: { 
      useCache?: boolean; 
      showLoading?: boolean; 
      background?: boolean;
    } = {}
  ) => {
    const { useCache = true, showLoading = true, background = false } = options;
    
    // Check cache first
    if (useCache && cacheKey) {
      const cachedData = cacheUtils.getCache(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLastUpdated(Date.now());
        setIsStale(false);
        
        // If background refresh is enabled, fetch fresh data
        if (backgroundRefresh && !background) {
          setTimeout(() => {
            fetchData({ useCache: false, showLoading: false, background: true });
          }, 100);
        }
        return;
      }
    }

    // Cleanup previous request
    cleanup();
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Set loading state with delay
    if (showLoading) {
      if (loadingDelay > 0) {
        loadingTimeoutRef.current = setTimeout(() => {
          setLoading(true);
        }, loadingDelay);
      } else {
        setLoading(true);
      }
    }

    try {
      setError(null);
      const result = await fetchWithRetry(0, signal);
      
      if (!signal.aborted) {
        setData(result);
        setLastUpdated(Date.now());
        setIsStale(false);
        
        // Cache the result
        if (cacheKey) {
          cacheUtils.setCache(cacheKey, result, cacheTTL);
        }
      }
    } catch (err) {
      if (!signal.aborted) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        // Use fallback data if available
        if (fallbackData && !data) {
          setData(fallbackData);
        }
        
        // Call error handler
        if (onError) {
          onError(error);
        }
      }
    } finally {
      if (!signal.aborted && showLoading) {
        setLoading(false);
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
      }
    }
  }, [
    cacheKey,
    cacheTTL,
    fetchWithRetry,
    backgroundRefresh,
    loadingDelay,
    fallbackData,
    onError,
    data,
    cleanup
  ]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchData({ useCache: false, showLoading: true });
  }, [fetchData]);

  // Prefetch function
  const prefetch = useCallback(async () => {
    await fetchData({ useCache: false, showLoading: false, background: true });
  }, [fetchData]);

  // Clear cache function
  const clearCache = useCallback(() => {
    if (cacheKey) {
      cacheUtils.clearCache(cacheKey);
    }
  }, [cacheKey]);

  // Initial fetch
  useEffect(() => {
    fetchData();
    
    // Set up refresh interval
    if (refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        if (backgroundRefresh) {
          fetchData({ useCache: false, showLoading: false, background: true });
        }
      }, refreshInterval);
    }
    
    return cleanup;
  }, [fetchData, refreshInterval, backgroundRefresh, cleanup, ...dependencies]);

  // Mark data as stale when dependencies change
  useEffect(() => {
    if (data && dependencies.length > 0) {
      setIsStale(true);
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    refresh,
    prefetch,
    clearCache,
    isStale,
    lastUpdated
  };
}

// Specialized hooks for common use cases
export function useModelsData(options: Omit<UseOptimizedDataOptions, 'cacheKey'> = {}) {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/models');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return useOptimizedData(fetcher, {
    ...options,
    cacheKey: 'models-data'
  });
}

export function useDatasetsData(options: Omit<UseOptimizedDataOptions, 'cacheKey'> = {}) {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/datasets');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return useOptimizedData(fetcher, {
    ...options,
    cacheKey: 'datasets-data'
  });
}

export function useLeaderboardData(options: Omit<UseOptimizedDataOptions, 'cacheKey'> = {}) {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/leaderboard');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return useOptimizedData(fetcher, {
    ...options,
    cacheKey: 'leaderboard-data'
  });
}

export function useUserData(options: Omit<UseOptimizedDataOptions, 'cacheKey'> = {}) {
  const fetcher = useCallback(async () => {
    const response = await fetch('/api/user/profile');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, []);

  return useOptimizedData(fetcher, {
    ...options,
    cacheKey: 'user-data',
    cacheTTL: 600000 // 10 minutes for user data
  });
}

// Batch data fetching hook
export function useBatchData<T extends Record<string, () => Promise<any>>>(
  fetchers: T,
  options: UseOptimizedDataOptions = {}
): {
  [K in keyof T]: UseOptimizedDataResult<Awaited<ReturnType<T[K]>>>;
} {
  const results = {} as any;
  
  Object.keys(fetchers).forEach(key => {
    const fetcher = fetchers[key];
    results[key] = useOptimizedData(fetcher, {
      ...options,
      cacheKey: `batch-${key}`
    });
  });
  
  return results;
} 