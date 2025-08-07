const MetricEnzyme = require('../models/MetricEnzyme');
const MetricSpecies = require('../models/MetricSpecies');
const MetricAll = require('../models/MetricAll');
const ErrorType = require('../models/ErrorType');
const Model = require('../models/Model');

// 酶指标相关控制器
const enzymeController = {
  // 获取所有酶指标
  getAllMetrics: async (req, res) => {
    try {
      const { page = 1, limit = 10, enzyme } = req.query;
      const offset = (page - 1) * limit;

      let metrics;
      if (enzyme) {
        metrics = await MetricEnzyme.getMetricsByEnzyme(enzyme);
      } else {
        metrics = await MetricEnzyme.getAllMetrics();
      }

      const paginatedMetrics = metrics.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: {
          metrics: paginatedMetrics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: metrics.length,
            pages: Math.ceil(metrics.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取酶指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 根据模型ID获取酶指标
  getMetricsByModelId: async (req, res) => {
    try {
      const { modelId } = req.params;
      const metrics = await MetricEnzyme.getMetricsByModelId(modelId);

      res.json({
        success: true,
        data: {
          metrics
        }
      });
    } catch (error) {
      console.error('获取模型酶指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 创建酶指标
  createMetric: async (req, res) => {
    try {
      const metricData = req.body;

      // 验证模型是否存在
      const model = await Model.getModelById(metricData.model_id);
      if (!model) {
        return res.status(404).json({
          success: false,
          message: '模型不存在'
        });
      }

      const newMetric = await MetricEnzyme.createMetric(metricData);

      res.status(201).json({
        success: true,
        message: '酶指标创建成功',
        data: {
          metric: newMetric
        }
      });
    } catch (error) {
      console.error('创建酶指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 更新酶指标
  updateMetric: async (req, res) => {
    try {
      const { id } = req.params;
      const metricData = req.body;

      const updatedMetric = await MetricEnzyme.updateMetric(id, metricData);

      if (!updatedMetric) {
        return res.status(404).json({
          success: false,
          message: '酶指标不存在'
        });
      }

      res.json({
        success: true,
        message: '酶指标更新成功',
        data: {
          metric: updatedMetric
        }
      });
    } catch (error) {
      console.error('更新酶指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 删除酶指标
  deleteMetric: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedMetric = await MetricEnzyme.deleteMetric(id);

      if (!deletedMetric) {
        return res.status(404).json({
          success: false,
          message: '酶指标不存在'
        });
      }

      res.json({
        success: true,
        message: '酶指标删除成功'
      });
    } catch (error) {
      console.error('删除酶指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取酶指标排行榜
  getLeaderboard: async (req, res) => {
    try {
      const { enzyme, limit = 10 } = req.query;
      const leaderboard = await MetricEnzyme.getEnzymeLeaderboard(enzyme, limit);

      res.json({
        success: true,
        data: {
          leaderboard,
          enzyme: enzyme || 'all'
        }
      });
    } catch (error) {
      console.error('获取酶指标排行榜错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取所有酶类型
  getAllEnzymes: async (req, res) => {
    try {
      const enzymes = await MetricEnzyme.getAllEnzymes();

      res.json({
        success: true,
        data: {
          enzymes
        }
      });
    } catch (error) {
      console.error('获取酶类型错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取酶指标统计
  getStats: async (req, res) => {
    try {
      const stats = await MetricEnzyme.getEnzymeStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('获取酶指标统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

// 物种指标相关控制器
const speciesController = {
  // 获取所有物种指标
  getAllMetrics: async (req, res) => {
    try {
      const { page = 1, limit = 10, species } = req.query;
      const offset = (page - 1) * limit;

      let metrics;
      if (species) {
        metrics = await MetricSpecies.getMetricsBySpecies(species);
      } else {
        metrics = await MetricSpecies.getAllMetrics();
      }

      const paginatedMetrics = metrics.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: {
          metrics: paginatedMetrics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: metrics.length,
            pages: Math.ceil(metrics.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取物种指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 根据模型ID获取物种指标
  getMetricsByModelId: async (req, res) => {
    try {
      const { modelId } = req.params;
      const metrics = await MetricSpecies.getMetricsByModelId(modelId);

      res.json({
        success: true,
        data: {
          metrics
        }
      });
    } catch (error) {
      console.error('获取模型物种指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 创建物种指标
  createMetric: async (req, res) => {
    try {
      const metricData = req.body;

      // 验证模型是否存在
      const model = await Model.getModelById(metricData.model_id);
      if (!model) {
        return res.status(404).json({
          success: false,
          message: '模型不存在'
        });
      }

      const newMetric = await MetricSpecies.createMetric(metricData);

      res.status(201).json({
        success: true,
        message: '物种指标创建成功',
        data: {
          metric: newMetric
        }
      });
    } catch (error) {
      console.error('创建物种指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 更新物种指标
  updateMetric: async (req, res) => {
    try {
      const { id } = req.params;
      const metricData = req.body;

      const updatedMetric = await MetricSpecies.updateMetric(id, metricData);

      if (!updatedMetric) {
        return res.status(404).json({
          success: false,
          message: '物种指标不存在'
        });
      }

      res.json({
        success: true,
        message: '物种指标更新成功',
        data: {
          metric: updatedMetric
        }
      });
    } catch (error) {
      console.error('更新物种指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 删除物种指标
  deleteMetric: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedMetric = await MetricSpecies.deleteMetric(id);

      if (!deletedMetric) {
        return res.status(404).json({
          success: false,
          message: '物种指标不存在'
        });
      }

      res.json({
        success: true,
        message: '物种指标删除成功'
      });
    } catch (error) {
      console.error('删除物种指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取物种指标排行榜
  getLeaderboard: async (req, res) => {
    try {
      const { species, limit = 10 } = req.query;
      const leaderboard = await MetricSpecies.getSpeciesLeaderboard(species, limit);

      res.json({
        success: true,
        data: {
          leaderboard,
          species: species || 'all'
        }
      });
    } catch (error) {
      console.error('获取物种指标排行榜错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取所有物种类型
  getAllSpecies: async (req, res) => {
    try {
      const species = await MetricSpecies.getAllSpecies();

      res.json({
        success: true,
        data: {
          species
        }
      });
    } catch (error) {
      console.error('获取物种类型错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取物种指标统计
  getStats: async (req, res) => {
    try {
      const stats = await MetricSpecies.getSpeciesStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('获取物种指标统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取物种与酶的交叉对比
  getSpeciesEnzymeComparison: async (req, res) => {
    try {
      const { modelId } = req.params;
      const comparison = await MetricSpecies.getSpeciesEnzymeComparison(modelId);

      res.json({
        success: true,
        data: {
          comparison
        }
      });
    } catch (error) {
      console.error('获取物种酶对比错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

// 汇总指标相关控制器
const allController = {
  // 获取所有汇总指标
  getAllMetrics: async (req, res) => {
    try {
      const { page = 1, limit = 100 } = req.query;
      const offset = (page - 1) * limit;

      const metrics = await MetricAll.getAllMetrics();
      const paginatedMetrics = metrics.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: {
          metrics: paginatedMetrics,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: metrics.length,
            pages: Math.ceil(metrics.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取汇总指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 根据模型ID获取汇总指标
  getMetricsByModelId: async (req, res) => {
    try {
      const { modelId } = req.params;
      const metrics = await MetricAll.getMetricsByModelId(modelId);

      res.json({
        success: true,
        data: {
          metrics
        }
      });
    } catch (error) {
      console.error('获取模型汇总指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 创建汇总指标
  createMetric: async (req, res) => {
    try {
      const metricData = req.body;

      // 验证模型是否存在
      const model = await Model.getModelById(metricData.model_id);
      if (!model) {
        return res.status(404).json({
          success: false,
          message: '模型不存在'
        });
      }

      const newMetric = await MetricAll.createMetric(metricData);

      res.status(201).json({
        success: true,
        message: '汇总指标创建成功',
        data: {
          metric: newMetric
        }
      });
    } catch (error) {
      console.error('创建汇总指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 更新汇总指标
  updateMetric: async (req, res) => {
    try {
      const { id } = req.params;
      const metricData = req.body;

      const updatedMetric = await MetricAll.updateMetric(id, metricData);

      if (!updatedMetric) {
        return res.status(404).json({
          success: false,
          message: '汇总指标不存在'
        });
      }

      res.json({
        success: true,
        message: '汇总指标更新成功',
        data: {
          metric: updatedMetric
        }
      });
    } catch (error) {
      console.error('更新汇总指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 删除汇总指标
  deleteMetric: async (req, res) => {
    try {
      const { id } = req.params;

      const deletedMetric = await MetricAll.deleteMetric(id);

      if (!deletedMetric) {
        return res.status(404).json({
          success: false,
          message: '汇总指标不存在'
        });
      }

      res.json({
        success: true,
        message: '汇总指标删除成功'
      });
    } catch (error) {
      console.error('删除汇总指标错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取汇总指标排行榜
  getLeaderboard: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await MetricAll.getLeaderboard(limit);

      res.json({
        success: true,
        data: {
          leaderboard
        }
      });
    } catch (error) {
      console.error('获取汇总指标排行榜错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取汇总指标统计
  getStats: async (req, res) => {
    try {
      const stats = await MetricAll.getStats();

      res.json({
        success: true,
        data: {
          stats
        }
      });
    } catch (error) {
      console.error('获取汇总指标统计错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

// 错误类型相关控制器
const errorTypeController = {
  // 获取所有错误类型数据
  getAllErrorTypes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const errorTypes = await ErrorType.getAllErrorTypes();
      const paginatedErrorTypes = errorTypes.slice(offset, offset + parseInt(limit));

      res.json({
        success: true,
        data: {
          metrics: paginatedErrorTypes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: errorTypes.length,
            pages: Math.ceil(errorTypes.length / limit)
          }
        }
      });
    } catch (error) {
      console.error('获取错误类型数据错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 根据模型ID获取错误类型数据
  getErrorTypesByModelId: async (req, res) => {
    try {
      const { modelId } = req.params;
      const errorTypes = await ErrorType.getErrorTypesByModelId(modelId);

      res.json({
        success: true,
        data: errorTypes
      });
    } catch (error) {
      console.error('获取模型错误类型数据错误:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // 创建错误类型数据
  createErrorType: async (req, res) => {
    try {
      const errorType = await ErrorType.createErrorType(req.body);
      res.status(201).json({
        success: true,
        data: errorType
      });
    } catch (error) {
      console.error('创建错误类型数据错误:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 更新错误类型数据
  updateErrorType: async (req, res) => {
    try {
      const { id } = req.params;
      const errorType = await ErrorType.updateErrorType(id, req.body);
      res.json({
        success: true,
        data: errorType
      });
    } catch (error) {
      console.error('更新错误类型数据错误:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 删除错误类型数据
  deleteErrorType: async (req, res) => {
    try {
      const { id } = req.params;
      const errorType = await ErrorType.deleteErrorType(id);
      res.json({
        success: true,
        data: errorType
      });
    } catch (error) {
      console.error('删除错误类型数据错误:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  },

  // 获取错误类型排行榜
  getLeaderboard: async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      const leaderboard = await ErrorType.getLeaderboard(parseInt(limit));
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error('获取错误类型排行榜错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  },

  // 获取错误类型统计信息
  getStats: async (req, res) => {
    try {
      const stats = await ErrorType.getErrorTypeStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('获取错误类型统计信息错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
};

module.exports = {
  enzymeController,
  speciesController,
  allController,
  errorTypeController
}; 