const pool = require('../config/database');

class MetricSpecies {
  // 获取所有物种评估指标
  static async getAllMetrics() {
    try {
      const result = await pool.query(`
        SELECT ms.*, m.name as model_name, m.architecture
        FROM metric_species ms
        JOIN model m ON ms.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY ms.id DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`获取物种评估指标失败: ${error.message}`);
    }
  }

  // 根据模型ID获取物种评估指标
  static async getMetricsByModelId(modelId) {
    try {
      const result = await pool.query(
        'SELECT * FROM metric_species WHERE model_id = $1 ORDER BY species',
        [modelId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`获取模型物种评估指标失败: ${error.message}`);
    }
  }

  // 根据物种类型获取评估指标
  static async getMetricsBySpecies(species) {
    try {
      const result = await pool.query(`
        SELECT ms.*, m.name as model_name, m.architecture
        FROM metric_species ms
        JOIN model m ON ms.model_id = m.id
        WHERE ms.species = $1 AND m.is_delete = FALSE
        ORDER BY ms.auc DESC
      `, [species]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取物种评估指标失败: ${error.message}`);
    }
  }

  // 创建新的物种评估指标
  static async createMetric(metricData) {
    const {
      model_id,
      aa_precision,
      aa_recall,
      pep_precision,
      pep_recall,
      ptm_precision,
      ptm_recall,
      auc,
      species
    } = metricData;

    try {
      const result = await pool.query(`
        INSERT INTO metric_species 
        (model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, species)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
      `, [model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, species]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`创建物种评估指标失败: ${error.message}`);
    }
  }

  // 更新物种评估指标
  static async updateMetric(id, metricData) {
    const {
      aa_precision,
      aa_recall,
      pep_precision,
      pep_recall,
      ptm_precision,
      ptm_recall,
      auc,
      species
    } = metricData;

    try {
      const result = await pool.query(`
        UPDATE metric_species SET 
        aa_precision = $1, aa_recall = $2, pep_precision = $3, pep_recall = $4,
        ptm_precision = $5, ptm_recall = $6, auc = $7, species = $8
        WHERE id = $9 RETURNING *
      `, [aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, species, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`更新物种评估指标失败: ${error.message}`);
    }
  }

  // 删除物种评估指标
  static async deleteMetric(id) {
    try {
      const result = await pool.query(
        'DELETE FROM metric_species WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`删除物种评估指标失败: ${error.message}`);
    }
  }

  // 获取物种评估排行榜
  static async getSpeciesLeaderboard(species = null, limit = 10) {
    try {
      let query = `
        SELECT ms.*, m.name as model_name, m.architecture, m.date
        FROM metric_species ms
        JOIN model m ON ms.model_id = m.id
        WHERE m.is_delete = FALSE
      `;
      let params = [];

      if (species) {
        query += ' AND ms.species = $1';
        params.push(species);
      }

      query += ` ORDER BY ms.auc DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`获取物种评估排行榜失败: ${error.message}`);
    }
  }

  // 获取所有物种类型
  static async getAllSpecies() {
    try {
      const result = await pool.query(
        'SELECT DISTINCT species FROM metric_species ORDER BY species'
      );
      return result.rows.map(row => row.species);
    } catch (error) {
      throw new Error(`获取物种类型列表失败: ${error.message}`);
    }
  }

  // 获取物种评估统计信息
  static async getSpeciesStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_evaluations,
          COUNT(DISTINCT species) as unique_species,
          COUNT(DISTINCT model_id) as evaluated_models,
          AVG(auc) as avg_auc,
          MAX(auc) as max_auc,
          MIN(auc) as min_auc
        FROM metric_species ms
        JOIN model m ON ms.model_id = m.id
        WHERE m.is_delete = FALSE
      `);
      return {
        total_evaluations: parseInt(result.rows[0].total_evaluations),
        unique_species: parseInt(result.rows[0].unique_species),
        evaluated_models: parseInt(result.rows[0].evaluated_models),
        avg_auc: parseFloat(result.rows[0].avg_auc) || 0,
        max_auc: parseFloat(result.rows[0].max_auc) || 0,
        min_auc: parseFloat(result.rows[0].min_auc) || 0
      };
    } catch (error) {
      throw new Error(`获取物种评估统计失败: ${error.message}`);
    }
  }

  // 获取物种与酶的交叉评估对比
  static async getSpeciesEnzymeComparison(modelId) {
    try {
      const result = await pool.query(`
        SELECT 
          ms.species,
          me.enzyme,
          ms.auc as species_auc,
          me.auc as enzyme_auc,
          ABS(ms.auc - me.auc) as auc_difference
        FROM metric_species ms
        JOIN metric_enzyme me ON ms.model_id = me.model_id
        WHERE ms.model_id = $1
        ORDER BY auc_difference DESC
      `, [modelId]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取物种酶对比失败: ${error.message}`);
    }
  }
}

module.exports = MetricSpecies; 