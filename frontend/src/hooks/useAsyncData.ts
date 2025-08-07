import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T | null;
  cacheKey?: string;
  cacheTTL?: number; // Cache expiration time (milliseconds)
  retryCount?: number;
  retryDelay?: number;
  backgroundRefresh?: boolean;
  refreshInterval?: number;
  dependencies?: any[];
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  loadingDelay?: number; // Delay showing loading state
  staleWhileRevalidate?: boolean; // Show stale data while revalidating in background
}

interface AsyncDataState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  lastUpdated: number | null;
}

interface UseAsyncDataResult<T> extends AsyncDataState<T> {
  refetch: (force?: boolean) => Promise<void>;
  mutate: (newData: T | ((prev: T | null) => T)) => void;
  reset: () => void;
}

// 内存缓存管理
class DataCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number) {
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)), // 深拷贝避免引用问题
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const { data, timestamp, ttl } = cached;
    const now = Date.now();

    if (now - timestamp > ttl) {
      this.cache.delete(key);
      return null;
    }

    return JSON.parse(JSON.stringify(data)); // 深拷贝
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

const dataCache = new DataCache();

// 并发请求去重
const pendingRequests = new Map<string, Promise<any>>();

function useAsyncData<T = any>(
  fetcher: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataResult<T> {
  const {
    initialData = null,
    cacheKey,
    cacheTTL = 300000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000,
    backgroundRefresh = true,
    refreshInterval = 0,
    dependencies = [],
    onSuccess,
    onError,
    loadingDelay = 200,
    staleWhileRevalidate = true
  } = options;

  const [state, setState] = useState<AsyncDataState<T>>({
    data: initialData,
    loading: false,
    error: null,
    isStale: false,
    lastUpdated: null
  });

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const abortControllerRef = useRef<AbortController | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 清理函数
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
  }, []);

  // 带重试的获取函数
  const fetchWithRetry = useCallback(async (
    attempt = 0,
    signal?: AbortSignal
  ): Promise<T> => {
    try {
      const result = await fetcherRef.current();
      return result;
    } catch (err) {
      if (signal?.aborted) {
        throw new Error('Request aborted');
      }
      
      if (attempt < retryCount) {
        console.log(`Retry attempt ${attempt + 1}/${retryCount} for ${cacheKey}`);
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
        return fetchWithRetry(attempt + 1, signal);
      }
      
      throw err;
    }
  }, [retryCount, retryDelay, cacheKey]);

  // 主要的数据获取函数
  const fetchData = useCallback(async (
    force = false,
    silent = false
  ): Promise<void> => {
    // 检查缓存
    if (!force && cacheKey) {
      const cachedData = dataCache.get(cacheKey);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          isStale: false,
          lastUpdated: Date.now()
        }));

        // 如果启用stale-while-revalidate，在后台刷新数据
        if (staleWhileRevalidate && backgroundRefresh) {
          setTimeout(() => fetchData(true, true), 100);
        }
        return;
      }
    }

    // 去重并发请求
    const requestKey = cacheKey || 'default';
    if (pendingRequests.has(requestKey)) {
      try {
        const result = await pendingRequests.get(requestKey);
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          isStale: false,
          lastUpdated: Date.now()
        }));
        return;
      } catch (error) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error as Error,
          isStale: true
        }));
        return;
      }
    }

    // 设置loading状态（带延迟）
    if (!silent) {
      if (loadingDelay > 0) {
        loadingTimeoutRef.current = setTimeout(() => {
          setState(prev => ({ ...prev, loading: true, error: null }));
        }, loadingDelay);
      } else {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }
    }

    // 创建abort controller
    cleanup();
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // 创建请求Promise
    const requestPromise = fetchWithRetry(0, signal);
    pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      
      // 更新状态
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        isStale: false,
        lastUpdated: Date.now()
      }));

      // 缓存结果
      if (cacheKey) {
        dataCache.set(cacheKey, result, cacheTTL);
      }

      // 调用成功回调
      onSuccess?.(result);

    } catch (error) {
      if (!signal.aborted) {
        const errorObj = error as Error;
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorObj,
          isStale: true
        }));

        onError?.(errorObj);
      }
    } finally {
      pendingRequests.delete(requestKey);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    }
  }, [force, cacheKey, cacheTTL, onSuccess, onError, loadingDelay, staleWhileRevalidate, backgroundRefresh, fetchWithRetry, cleanup]);

  // 手动刷新
  const refetch = useCallback((force = false) => {
    return fetchData(force, false);
  }, [fetchData]);

  // 手动更新数据
  const mutate = useCallback((newData: T | ((prev: T | null) => T)) => {
    setState(prev => {
      const updatedData = typeof newData === 'function' 
        ? (newData as (prev: T | null) => T)(prev.data)
        : newData;
      
      // 更新缓存
      if (cacheKey) {
        dataCache.set(cacheKey, updatedData, cacheTTL);
      }

      return {
        ...prev,
        data: updatedData,
        lastUpdated: Date.now(),
        isStale: false
      };
    });
  }, [cacheKey, cacheTTL]);

  // 重置状态
  const reset = useCallback(() => {
    cleanup();
    setState({
      data: initialData,
      loading: false,
      error: null,
      isStale: false,
      lastUpdated: null
    });
    if (cacheKey) {
      dataCache.invalidate(cacheKey);
    }
  }, [cleanup, initialData, cacheKey]);

  // 初始化和依赖更新
  useEffect(() => {
    fetchData(false, false);
  }, [fetchData, ...dependencies]);

  // 设置定时刷新
  useEffect(() => {
    if (refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true, true);
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, fetchData]);

  // 清理副作用
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    refetch,
    mutate,
    reset
  };
}

// 专用钩子
export function useModelsData(options: Omit<UseAsyncDataOptions<any>, 'cacheKey'> = {}) {
  return useAsyncData(
    async () => {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    {
      ...options,
      cacheKey: 'models-data',
      cacheTTL: 300000, // 5 minutes
      backgroundRefresh: true
    }
  );
}

export function useMetricsData(type: 'enzyme' | 'species' | 'all', options: Omit<UseAsyncDataOptions<any>, 'cacheKey'> = {}) {
  return useAsyncData(
    async () => {
      const response = await fetch(`/api/metrics/${type}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    {
      ...options,
      cacheKey: `metrics-${type}`,
      cacheTTL: 180000, // 3 minutes
      backgroundRefresh: true
    }
  );
}

export function useLeaderboardData(type: string, category?: string, options: Omit<UseAsyncDataOptions<any>, 'cacheKey'> = {}) {
  const cacheKey = `leaderboard-${type}-${category || 'all'}`;
  
  return useAsyncData(
    async () => {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      
      const response = await fetch(`/api/leaderboard/${type}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    },
    {
      ...options,
      cacheKey,
      cacheTTL: 120000, // 2 minutes
      backgroundRefresh: true
    }
  );
}

// 缓存管理工具
export const cacheUtils = {
  invalidate: (key: string) => dataCache.invalidate(key),
  clear: () => dataCache.clear(),
  getStats: () => dataCache.getStats()
};

export default useAsyncData; 