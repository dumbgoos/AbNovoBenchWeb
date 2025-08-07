const pool = require('../config/database');

class ErrorType {
  // 获取所有错误类型数据
  static async getAllErrorTypes() {
    try {
      const result = await pool.query(`
        SELECT et.*, m.name as model_name, m.architecture
        FROM error_type et
        JOIN model m ON et.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY et.number_of_total_errors ASC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`获取错误类型数据失败: ${error.message}`);
    }
  }

  // 根据模型ID获取错误类型数据
  static async getErrorTypesByModelId(modelId) {
    try {
      const result = await pool.query(
        'SELECT * FROM error_type WHERE model_id = $1',
        [modelId]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`获取模型错误类型数据失败: ${error.message}`);
    }
  }

  // 创建错误类型数据
  static async createErrorType(errorTypeData) {
    try {
      const {
        model_id,
        number_of_total_predictions,
        number_of_total_errors,
        inversion_first_3_aas_percent,
        inversion_last_3_aas_percent,
        inversion_first_and_last_3_aas_percent,
        aa_1_replaced_by_1_or_2_percent,
        aa_2_replaced_by_2_percent,
        aa_3_replaced_by_3_percent,
        aa_4_replaced_by_4_percent,
        aa_5_replaced_by_5_percent,
        aa_6_replaced_by_6_percent,
        more_than_6_aas_wrong_percent,
        other_percent
      } = errorTypeData;

      const result = await pool.query(
        `INSERT INTO error_type 
         (model_id, number_of_total_predictions, number_of_total_errors, 
          inversion_first_3_aas_percent, inversion_last_3_aas_percent, 
          inversion_first_and_last_3_aas_percent, aa_1_replaced_by_1_or_2_percent,
          aa_2_replaced_by_2_percent, aa_3_replaced_by_3_percent, 
          aa_4_replaced_by_4_percent, aa_5_replaced_by_5_percent, 
          aa_6_replaced_by_6_percent, more_than_6_aas_wrong_percent, other_percent)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [model_id, number_of_total_predictions, number_of_total_errors,
         inversion_first_3_aas_percent, inversion_last_3_aas_percent,
         inversion_first_and_last_3_aas_percent, aa_1_replaced_by_1_or_2_percent,
         aa_2_replaced_by_2_percent, aa_3_replaced_by_3_percent,
         aa_4_replaced_by_4_percent, aa_5_replaced_by_5_percent,
         aa_6_replaced_by_6_percent, more_than_6_aas_wrong_percent, other_percent]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`创建错误类型数据失败: ${error.message}`);
    }
  }

  // 更新错误类型数据
  static async updateErrorType(id, errorTypeData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      // 构建动态更新字段
      for (const [key, value] of Object.entries(errorTypeData)) {
        if (value !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (fields.length === 0) {
        throw new Error('没有要更新的字段');
      }

      values.push(id);
      const query = `UPDATE error_type SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('错误类型数据不存在');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`更新错误类型数据失败: ${error.message}`);
    }
  }

  // 删除错误类型数据
  static async deleteErrorType(id) {
    try {
      const result = await pool.query(
        'DELETE FROM error_type WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('错误类型数据不存在');
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`删除错误类型数据失败: ${error.message}`);
    }
  }

  // 获取错误类型统计信息
  static async getErrorTypeStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_models,
          AVG(number_of_total_errors) as avg_total_errors,
          MIN(number_of_total_errors) as min_total_errors,
          MAX(number_of_total_errors) as max_total_errors,
          AVG(inversion_first_3_aas_percent) as avg_inversion_first_3,
          AVG(inversion_last_3_aas_percent) as avg_inversion_last_3,
          AVG(more_than_6_aas_wrong_percent) as avg_more_than_6_wrong
        FROM error_type et
        JOIN model m ON et.model_id = m.id
        WHERE m.is_delete = FALSE
      `);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`获取错误类型统计信息失败: ${error.message}`);
    }
  }

  // 获取排行榜数据
  static async getLeaderboard(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT et.*, m.name as model_name, m.architecture
        FROM error_type et
        JOIN model m ON et.model_id = m.id
        WHERE m.is_delete = FALSE
        ORDER BY et.number_of_total_errors ASC, et.more_than_6_aas_wrong_percent ASC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取错误类型排行榜失败: ${error.message}`);
    }
  }
}

module.exports = ErrorType; 