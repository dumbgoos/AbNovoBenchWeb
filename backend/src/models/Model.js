const pool = require('../config/database');

class Model {
  // 获取所有模型
  static async getAllModels(limit = null, offset = null) {
    try {
      let query = 'SELECT * FROM model WHERE is_delete = FALSE ORDER BY date DESC';
      let params = [];
      
      if (limit !== null) {
        query += ' LIMIT $1';
        params.push(limit);
        
        if (offset !== null) {
          query += ' OFFSET $2';
          params.push(offset);
        }
      }
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`获取模型列表失败: ${error.message}`);
    }
  }

  // 根据ID获取模型
  static async getModelById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM model WHERE id = $1 AND is_delete = FALSE',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`获取模型详情失败: ${error.message}`);
    }
  }

  // 创建新模型
  static async createModel(modelData) {
    const {
      code_path,
      checkpoint_path,
      name,
      log_path,
      info,
      url,
      date,
      architecture
    } = modelData;

    try {
      const result = await pool.query(
        `INSERT INTO model (code_path, checkpoint_path, name, log_path, info, url, date, architecture)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [code_path, checkpoint_path, name, log_path, info, url, date, architecture]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`创建模型失败: ${error.message}`);
    }
  }

  // 更新模型
  static async updateModel(id, modelData) {
    try {
      // 构建动态更新查询
      const updates = [];
      const values = [];
      let paramIndex = 1;

      // 只更新提供的字段
      const allowedFields = ['code_path', 'checkpoint_path', 'name', 'log_path', 'info', 'url', 'date', 'architecture'];
      
      for (const field of allowedFields) {
        if (modelData[field] !== undefined) {
          updates.push(`${field} = $${paramIndex}`);
          values.push(modelData[field]);
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('没有可更新的字段');
      }

      // 添加WHERE条件的参数
      values.push(id);

      const query = `UPDATE model SET ${updates.join(', ')} WHERE id = $${paramIndex} AND is_delete = FALSE RETURNING *`;
      
      console.log('Update query:', query);
      console.log('Update values:', values);

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('模型不存在或已被删除');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Model.updateModel error:', error);
      throw new Error(`更新模型失败: ${error.message}`);
    }
  }

  // 软删除模型
  static async deleteModel(id) {
    try {
      const result = await pool.query(
        'UPDATE model SET is_delete = TRUE WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`删除模型失败: ${error.message}`);
    }
  }

  // 获取模型统计信息
  static async getModelStats() {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) as total_models FROM model WHERE is_delete = FALSE'
      );
      return { total_models: parseInt(result.rows[0].total_models) };
    } catch (error) {
      throw new Error(`获取模型统计失败: ${error.message}`);
    }
  }

  // 根据架构搜索模型
  static async searchModelsByArchitecture(architecture) {
    try {
      const result = await pool.query(
        'SELECT * FROM model WHERE architecture ILIKE $1 AND is_delete = FALSE ORDER BY date DESC',
        [`%${architecture}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`搜索模型失败: ${error.message}`);
    }
  }
}

module.exports = Model; 