const pool = require('../config/database');

class MetricEnzyme {
  // 获取所有酶评估指标
  static async getAllMetrics() {
    try {
      const result = await pool.query(`
        SELECT me.*, m.name as model_name, m.architecture
        FROM metric_enzyme me
        JOIN model m ON me.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY me.id DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`获取酶评估指标失败: ${error.message}`);
    }
  }

  // 根据模型ID获取酶评估指标
  static async getMetricsByModelId(modelId) {
    try {
      const result = await pool.query(
        'SELECT * FROM metric_enzyme WHERE model_id = $1 ORDER BY enzyme',
        [modelId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`获取模型酶评估指标失败: ${error.message}`);
    }
  }

  // 根据酶类型获取评估指标
  static async getMetricsByEnzyme(enzyme) {
    try {
      const result = await pool.query(`
        SELECT me.*, m.name as model_name, m.architecture
        FROM metric_enzyme me
        JOIN model m ON me.model_id = m.id
        WHERE me.enzyme = $1 AND m.is_delete = FALSE
        ORDER BY me.auc DESC
      `, [enzyme]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取酶评估指标失败: ${error.message}`);
    }
  }

  // 创建新的酶评估指标
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
      enzyme
    } = metricData;

    try {
      const result = await pool.query(`
        INSERT INTO metric_enzyme 
        (model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, enzyme)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
      `, [model_id, aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, enzyme]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`创建酶评估指标失败: ${error.message}`);
    }
  }

  // 更新酶评估指标
  static async updateMetric(id, metricData) {
    const {
      aa_precision,
      aa_recall,
      pep_precision,
      pep_recall,
      ptm_precision,
      ptm_recall,
      auc,
      enzyme
    } = metricData;

    try {
      const result = await pool.query(`
        UPDATE metric_enzyme SET 
        aa_precision = $1, aa_recall = $2, pep_precision = $3, pep_recall = $4,
        ptm_precision = $5, ptm_recall = $6, auc = $7, enzyme = $8
        WHERE id = $9 RETURNING *
      `, [aa_precision, aa_recall, pep_precision, pep_recall, ptm_precision, ptm_recall, auc, enzyme, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`更新酶评估指标失败: ${error.message}`);
    }
  }

  // 删除酶评估指标
  static async deleteMetric(id) {
    try {
      const result = await pool.query(
        'DELETE FROM metric_enzyme WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`删除酶评估指标失败: ${error.message}`);
    }
  }

  // 获取酶评估排行榜
  static async getEnzymeLeaderboard(enzyme = null, limit = 10) {
    try {
      let query = `
        SELECT me.*, m.name as model_name, m.architecture, m.date
        FROM metric_enzyme me
        JOIN model m ON me.model_id = m.id
        WHERE m.is_delete = FALSE
      `;
      let params = [];

      if (enzyme) {
        query += ' AND me.enzyme = $1';
        params.push(enzyme);
      }

      query += ` ORDER BY me.auc DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`获取酶评估排行榜失败: ${error.message}`);
    }
  }

  // 获取所有酶类型
  static async getAllEnzymes() {
    try {
      const result = await pool.query(
        'SELECT DISTINCT enzyme FROM metric_enzyme ORDER BY enzyme'
      );
      return result.rows.map(row => row.enzyme);
    } catch (error) {
      throw new Error(`获取酶类型列表失败: ${error.message}`);
    }
  }

  // 获取酶评估统计信息
  static async getEnzymeStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_evaluations,
          COUNT(DISTINCT enzyme) as unique_enzymes,
          COUNT(DISTINCT model_id) as evaluated_models,
          AVG(auc) as avg_auc,
          MAX(auc) as max_auc,
          MIN(auc) as min_auc
        FROM metric_enzyme me
        JOIN model m ON me.model_id = m.id
        WHERE m.is_delete = FALSE
      `);
      return {
        total_evaluations: parseInt(result.rows[0].total_evaluations),
        unique_enzymes: parseInt(result.rows[0].unique_enzymes),
        evaluated_models: parseInt(result.rows[0].evaluated_models),
        avg_auc: parseFloat(result.rows[0].avg_auc) || 0,
        max_auc: parseFloat(result.rows[0].max_auc) || 0,
        min_auc: parseFloat(result.rows[0].min_auc) || 0
      };
    } catch (error) {
      throw new Error(`获取酶评估统计失败: ${error.message}`);
    }
  }
}

module.exports = MetricEnzyme; 