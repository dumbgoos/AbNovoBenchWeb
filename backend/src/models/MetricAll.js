const pool = require('../config/database');

class MetricAll {
  // 获取所有汇总评估指标
  static async getAllMetrics() {
    try {
      const result = await pool.query(`
        SELECT ma.*, m.name as model_name, m.architecture
        FROM metric_all ma
        JOIN model m ON ma.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY ma.auc DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`获取汇总评估指标失败: ${error.message}`);
    }
  }

  // 根据模型ID获取汇总评估指标
  static async getMetricsByModelId(modelId) {
    try {
      const result = await pool.query(
        'SELECT * FROM metric_all WHERE model_id = $1',
        [modelId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`获取模型汇总评估指标失败: ${error.message}`);
    }
  }

  // 创建汇总评估指标
  static async createMetric(metricData) {
    try {
      const {
        model_id,
        aa_precision,
        aa_recall,
        pep_precision,
        pep_recall,
        ptm_precision,
        ptm_recall,
        auc
      } = metricData;

      const result = await pool.query(
        `INSERT INTO metric_all 
         (model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`创建汇总评估指标失败: ${error.message}`);
    }
  }

  // 更新汇总评估指标
  static async updateMetric(id, metricData) {
    try {
      const {
        aa_precision,
        aa_recall,
        pep_precision,
        pep_recall,
        ptm_precision,
        ptm_recall,
        auc
      } = metricData;

      const result = await pool.query(
        `UPDATE metric_all 
         SET aa_precision = $2, aa_recall = $3, pep_precision = $4, pep_recall = $5,
             ptm_precision = $6, ptm_recall = $7, auc = $8
         WHERE id = $1
         RETURNING *`,
        [id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`更新汇总评估指标失败: ${error.message}`);
    }
  }

  // 删除汇总评估指标
  static async deleteMetric(id) {
    try {
      const result = await pool.query(
        'DELETE FROM metric_all WHERE id = $1 RETURNING *',
        [id]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`删除汇总评估指标失败: ${error.message}`);
    }
  }

  // 获取排行榜
  static async getLeaderboard(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT ma.*, m.name as model_name, m.architecture, m.date
        FROM metric_all ma
        JOIN model m ON ma.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY ma.auc DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      throw new Error(`获取排行榜失败: ${error.message}`);
    }
  }

  // 获取汇总评估统计信息
  static async getStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_evaluations,
          COUNT(DISTINCT model_id) as evaluated_models,
          AVG(auc) as avg_auc,
          MAX(auc) as max_auc,
          MIN(auc) as min_auc,
          AVG(aa_precision) as avg_aa_precision,
          AVG(pep_precision) as avg_pep_precision,
          AVG(ptm_precision) as avg_ptm_precision
        FROM metric_all ma
        JOIN model m ON ma.model_id = m.id
        WHERE m.is_delete = FALSE
      `);
      
      return {
        total_evaluations: parseInt(result.rows[0].total_evaluations),
        evaluated_models: parseInt(result.rows[0].evaluated_models),
        avg_auc: parseFloat(result.rows[0].avg_auc) || 0,
        max_auc: parseFloat(result.rows[0].max_auc) || 0,
        min_auc: parseFloat(result.rows[0].min_auc) || 0,
        avg_aa_precision: parseFloat(result.rows[0].avg_aa_precision) || 0,
        avg_pep_precision: parseFloat(result.rows[0].avg_pep_precision) || 0,
        avg_ptm_precision: parseFloat(result.rows[0].avg_ptm_precision) || 0
      };
    } catch (error) {
      throw new Error(`获取汇总评估统计失败: ${error.message}`);
    }
  }
}

module.exports = MetricAll; 