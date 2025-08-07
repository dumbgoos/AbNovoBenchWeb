const NodeCache = require('node-cache');

// 创建不同TTL的缓存实例
const modelCache = new NodeCache({ stdTTL: 300 }); // 5分钟缓存
const metricCache = new NodeCache({ stdTTL: 180 }); // 3分钟缓存
const statisticsCache = new NodeCache({ stdTTL: 600 }); // 10分钟缓存
const leaderboardCache = new NodeCache({ stdTTL: 120 }); // 2分钟缓存

class CacheManager {
  // 通用缓存方法
  static async getCachedData(cacheInstance, key, fetcher, forceRefresh = false) {
    if (!forceRefresh) {
      const cachedData = cacheInstance.get(key);
      if (cachedData) {
        console.log(`📋 Cache hit for key: ${key}`);
        return cachedData;
      }
    }

    console.log(`🔄 Cache miss for key: ${key}, fetching data...`);
    try {
      const data = await fetcher();
      cacheInstance.set(key, data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching data for key ${key}:`, error);
      throw error;
    }
  }

  // 模型相关缓存
  static async getModels(fetcher, forceRefresh = false) {
    return this.getCachedData(modelCache, 'all_models', fetcher, forceRefresh);
  }

  static async getModelById(id, fetcher, forceRefresh = false) {
    return this.getCachedData(modelCache, `model_${id}`, fetcher, forceRefresh);
  }

  static async getModelsByArchitecture(architecture, fetcher, forceRefresh = false) {
    return this.getCachedData(modelCache, `models_arch_${architecture}`, fetcher, forceRefresh);
  }

  // 指标相关缓存
  static async getEnzymeMetrics(fetcher, forceRefresh = false) {
    return this.getCachedData(metricCache, 'enzyme_metrics', fetcher, forceRefresh);
  }

  static async getSpeciesMetrics(fetcher, forceRefresh = false) {
    return this.getCachedData(metricCache, 'species_metrics', fetcher, forceRefresh);
  }

  static async getMetricsByModelId(modelId, type, fetcher, forceRefresh = false) {
    return this.getCachedData(metricCache, `metrics_${type}_${modelId}`, fetcher, forceRefresh);
  }

  // 排行榜缓存
  static async getLeaderboard(type, category, limit, fetcher, forceRefresh = false) {
    const key = `leaderboard_${type}_${category || 'all'}_${limit}`;
    return this.getCachedData(leaderboardCache, key, fetcher, forceRefresh);
  }

  // 统计数据缓存
  static async getStatistics(type, fetcher, forceRefresh = false) {
    return this.getCachedData(statisticsCache, `stats_${type}`, fetcher, forceRefresh);
  }

  // 批量获取模型指标（优化N+1查询）
  static async getBatchModelMetrics(modelIds, fetcher, forceRefresh = false) {
    const key = `batch_metrics_${modelIds.sort().join('_')}`;
    return this.getCachedData(metricCache, key, fetcher, forceRefresh);
  }

  // 清除缓存
  static clearModelCache() {
    modelCache.flushAll();
    console.log('🗑️ Model cache cleared');
  }

  static clearMetricCache() {
    metricCache.flushAll();
    console.log('🗑️ Metric cache cleared');
  }

  static clearStatisticsCache() {
    statisticsCache.flushAll();
    console.log('🗑️ Statistics cache cleared');
  }

  static clearLeaderboardCache() {
    leaderboardCache.flushAll();
    console.log('🗑️ Leaderboard cache cleared');
  }

  static clearAllCache() {
    this.clearModelCache();
    this.clearMetricCache();
    this.clearStatisticsCache();
    this.clearLeaderboardCache();
    console.log('🗑️ All caches cleared');
  }

  // 缓存统计信息
  static getCacheStats() {
    return {
      model: {
        keys: modelCache.keys().length,
        stats: modelCache.getStats()
      },
      metric: {
        keys: metricCache.keys().length,
        stats: metricCache.getStats()
      },
      statistics: {
        keys: statisticsCache.keys().length,
        stats: statisticsCache.getStats()
      },
      leaderboard: {
        keys: leaderboardCache.keys().length,
        stats: leaderboardCache.getStats()
      }
    };
  }
}

module.exports = CacheManager; 