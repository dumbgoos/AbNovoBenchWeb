const Model = require('../models/Model');
const MetricEnzyme = require('../models/MetricEnzyme');
const MetricSpecies = require('../models/MetricSpecies');
const CacheManager = require('../utils/cache');

// 获取所有模型
const getAllModels = async (req, res) => {
  try {
    const { page = 1, limit = 100, architecture } = req.query;
    const offset = (page - 1) * limit;

    console.log('Models API 请求参数:', { page, limit, architecture, offset });

    // 直接获取模型数据，不使用缓存避免问题
    let models;
    if (architecture) {
      models = await Model.searchModelsByArchitecture(architecture);
      console.log(`按架构搜索到 ${models.length} 个模型`);
    } else {
      models = await Model.getAllModels(parseInt(limit), offset);
      console.log(`获取到 ${models.length} 个模型，limit=${limit}, offset=${offset}`);
    }
    
    // 获取总数（不使用缓存，确保数据准确）
    const totalModels = await Model.getAllModels(); // 获取所有模型用于计算总数
    const total = totalModels.length;
    console.log(`数据库总模型数: ${total}`);
    
    const responseData = {
      success: true,
      message: '获取模型列表成功',
      data: {
        models,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: total,
          totalPages: Math.ceil(total / parseInt(limit)),
          hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    };

    console.log('返回响应:', {
      modelsCount: models.length,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json(responseData);
  } catch (error) {
    console.error('获取模型列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模型列表失败'
    });
  }
};

// 根据ID获取模型
const getModelById = async (req, res) => {
  try {
    const { id } = req.params;

    // 使用缓存获取单个模型
    const model = await CacheManager.getModelById(id, async () => {
      return await Model.getModelById(id);
    });

    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    res.json({
      success: true,
      message: '获取模型详情成功',
      data: {
        model
      }
    });
  } catch (error) {
    console.error('获取模型详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模型详情失败'
    });
  }
};

// 创建模型
const createModel = async (req, res) => {
  try {
    const {
      code_path,
      checkpoint_path,
      name,
      architecture,
      description,
      tags,
      paper_url,
      github_url,
      huggingface_url,
      is_public = true
    } = req.body;

    const model = await Model.createModel({
      code_path,
      checkpoint_path,
      name,
      architecture,
      description,
      tags,
      paper_url,
      github_url,
      huggingface_url,
      is_public
    });

    // 清除相关缓存
    CacheManager.clearModelCache();

    res.status(201).json({
      success: true,
      message: '模型创建成功',
      data: {
        model
      }
    });
  } catch (error) {
    console.error('创建模型错误:', error);
    res.status(500).json({
      success: false,
      message: '创建模型失败'
    });
  }
};

// 更新模型
const updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const model = await Model.updateModel(id, updateData);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    // 清除相关缓存
    CacheManager.clearModelCache();

    res.json({
      success: true,
      message: '模型更新成功',
      data: {
        model
      }
    });
  } catch (error) {
    console.error('更新模型错误:', error);
    res.status(500).json({
      success: false,
      message: '更新模型失败'
    });
  }
};

// 删除模型
const deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Model.deleteModel(id);

    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    // 清除相关缓存
    CacheManager.clearModelCache();
    CacheManager.clearMetricCache();

    res.json({
      success: true,
      message: '模型删除成功'
    });
  } catch (error) {
    console.error('删除模型错误:', error);
    res.status(500).json({
      success: false,
      message: '删除模型失败'
    });
  }
};

// 获取模型统计信息
const getModelStats = async (req, res) => {
  try {
    const stats = await CacheManager.getStatistics('model', async () => {
      return await Model.getModelStats();
    });

    res.json({
      success: true,
      message: '获取模型统计信息成功',
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('获取模型统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模型统计信息失败'
    });
  }
};

// 根据架构搜索模型
const searchModelsByArchitecture = async (req, res) => {
  try {
    const { architecture } = req.query;
    
    if (!architecture) {
      return res.status(400).json({
        success: false,
        message: '请提供架构参数'
      });
    }

    const models = await CacheManager.getModelsByArchitecture(architecture, async () => {
      return await Model.searchModelsByArchitecture(architecture);
    });

    res.json({
      success: true,
      message: '搜索模型成功',
      data: {
        models
      }
    });
  } catch (error) {
    console.error('搜索模型错误:', error);
    res.status(500).json({
      success: false,
      message: '搜索模型失败'
    });
  }
};

// 获取模型排行榜
const getModelLeaderboard = async (req, res) => {
  try {
    const { type = 'enzyme', category, limit = 10 } = req.query;

    const leaderboard = await CacheManager.getLeaderboard(type, category, limit, async () => {
      if (type === 'enzyme') {
        return await MetricEnzyme.getEnzymeLeaderboard(category, limit);
      } else if (type === 'species') {
        return await MetricSpecies.getSpeciesLeaderboard(category, limit);
      } else {
        throw new Error('无效的排行榜类型');
      }
    });

    res.json({
      success: true,
      data: {
        leaderboard,
        type,
        category: category || 'all'
      }
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 优化后的模型详细性能比较 - 解决N+1查询问题
const compareModels = async (req, res) => {
  try {
    const { models } = req.body; // 模型ID数组

    if (!Array.isArray(models) || models.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要比较的模型ID数组'
      });
    }

    // 使用批量缓存获取所有模型的详细信息
    const modelDetails = await CacheManager.getBatchModelMetrics(models, async () => {
      // 批量获取所有模型基本信息
      const modelInfoPromises = models.map(modelId => Model.getModelById(modelId));
      const modelInfos = await Promise.all(modelInfoPromises);

      // 批量获取所有酶指标 - 单次查询
      const enzymeMetricsQuery = `
        SELECT * FROM metric_enzyme 
        WHERE model_id = ANY($1::int[]) 
        ORDER BY model_id, enzyme
      `;
      const enzymeMetricsResult = await require('../config/database').query(enzymeMetricsQuery, [models]);
      
      // 批量获取所有物种指标 - 单次查询
      const speciesMetricsQuery = `
        SELECT * FROM metric_species 
        WHERE model_id = ANY($1::int[]) 
        ORDER BY model_id, species
      `;
      const speciesMetricsResult = await require('../config/database').query(speciesMetricsQuery, [models]);

      // 组织数据：按模型ID分组指标
      const enzymeMetricsByModel = {};
      const speciesMetricsByModel = {};

      enzymeMetricsResult.rows.forEach(metric => {
        if (!enzymeMetricsByModel[metric.model_id]) {
          enzymeMetricsByModel[metric.model_id] = [];
        }
        enzymeMetricsByModel[metric.model_id].push(metric);
      });

      speciesMetricsResult.rows.forEach(metric => {
        if (!speciesMetricsByModel[metric.model_id]) {
          speciesMetricsByModel[metric.model_id] = [];
        }
        speciesMetricsByModel[metric.model_id].push(metric);
      });

      // 组合结果
      const results = modelInfos.map((model, index) => {
        if (!model) return null;

        const modelId = models[index];
        return {
          model,
          metrics: {
            enzyme: enzymeMetricsByModel[modelId] || [],
            species: speciesMetricsByModel[modelId] || []
          }
        };
      });

      return results.filter(item => item !== null);
    });

    res.json({
      success: true,
      data: {
        comparison: modelDetails
      }
    });
  } catch (error) {
    console.error('模型比较错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取evaluation用的模型列表（包含accuracy数据）
const getEvaluationModels = async (req, res) => {
  try {
    console.log('Evaluation API 请求参数:', req.query);

    // 获取所有模型
    const models = await Model.getAllModels();
    console.log(`获取到 ${models.length} 个模型`);

    // 获取accuracy指标数据
    const MetricAll = require('../models/MetricAll');
    const accuracyMetrics = await MetricAll.getAllMetrics();
    console.log(`获取到 ${accuracyMetrics.length} 个accuracy指标`);

    // 合并模型数据和accuracy数据
    const modelsWithMetrics = models.map(model => {
      const metric = accuracyMetrics.find(m => m.model_id === model.id);
      if (metric) {
        return {
          id: model.id.toString(),
          name: model.name,
          category: model.architecture,
          aa_precision: parseFloat(metric.aa_precision) || 0,
          aa_recall: parseFloat(metric.aa_recall) || 0,
          peptide_precision: parseFloat(metric.pep_precision) || 0,
          peptide_recall: parseFloat(metric.pep_recall) || 0,
          ptm_precision: parseFloat(metric.ptm_precision) || 0,
          ptm_recall: parseFloat(metric.ptm_recall) || 0,
          auc: parseFloat(metric.auc) || 0,
          status: 'active'
        };
      } else {
        // 如果没有找到对应的指标数据，返回默认值
        return {
          id: model.id.toString(),
          name: model.name,
          category: model.architecture,
          aa_precision: 0,
          aa_recall: 0,
          peptide_precision: 0,
          peptide_recall: 0,
          ptm_precision: 0,
          ptm_recall: 0,
          auc: 0,
          status: 'active'
        };
      }
    });

    const responseData = {
      success: true,
      message: '获取evaluation数据成功',
      data: {
        models: modelsWithMetrics,
        datasets: [], // 暂时为空，后续可以添加数据集信息
        metrics: ['aa_precision', 'aa_recall', 'peptide_precision', 'peptide_recall', 'ptm_precision', 'ptm_recall', 'auc'],
        last_updated: new Date().toISOString()
      }
    };

    console.log('返回evaluation响应:', {
      modelsCount: modelsWithMetrics.length,
      metricsCount: accuracyMetrics.length
    });

    res.json(responseData);
  } catch (error) {
    console.error('获取evaluation数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取evaluation数据失败'
    });
  }
};

module.exports = {
  getAllModels,
  getModelById,
  createModel,
  updateModel,
  deleteModel,
  getModelStats,
  searchModelsByArchitecture,
  getModelLeaderboard,
  compareModels,
  getEvaluationModels
}; 