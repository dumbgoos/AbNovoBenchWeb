const pool = require('../config/database');

class UserSubmit {
  // 获取所有用户提交记录
  static async getAllSubmissions() {
    try {
      const result = await pool.query(`
        SELECT us.*, u.user_name, u.email
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_delete = FALSE
        ORDER BY us.id DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`获取用户提交记录失败: ${error.message}`);
    }
  }

  // 根据用户ID获取提交记录
  static async getSubmissionsByUserId(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM user_submit WHERE user_id = $1 ORDER BY id DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`获取用户提交记录失败: ${error.message}`);
    }
  }

  // 根据ID获取单个提交记录
  static async getSubmissionById(id) {
    try {
      const result = await pool.query(`
        SELECT us.*, u.user_name, u.email
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE us.id = $1 AND u.is_delete = FALSE
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`获取提交记录失败: ${error.message}`);
    }
  }

  // 创建新的用户提交记录
  static async createSubmission(submissionData) {
    const {
      user_id,
      code_url,      // 用户填写的GitHub URL
      code_path,     // 代码文件服务器路径
      model_path,    // 模型文件服务器路径
      model_info     // 模型信息JSON
    } = submissionData;

    try {
      const result = await pool.query(`
        INSERT INTO user_submit 
        (user_id, code_url, code_path, model_path, model_info)
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `, [user_id, code_url, code_path, model_path, model_info]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`创建用户提交记录失败: ${error.message}`);
    }
  }

  // 更新用户提交记录
  static async updateSubmission(id, submissionData) {
    const {
      code_url,
      code_path,
      model_path,
      model_info
    } = submissionData;

    try {
      const result = await pool.query(`
        UPDATE user_submit SET 
        code_url = $1, code_path = $2, model_path = $3, model_info = $4
        WHERE id = $5 RETURNING *
      `, [code_url, code_path, model_path, model_info, id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`更新用户提交记录失败: ${error.message}`);
    }
  }

  // 删除用户提交记录
  static async deleteSubmission(id) {
    try {
      const result = await pool.query(
        'DELETE FROM user_submit WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`删除用户提交记录失败: ${error.message}`);
    }
  }

  // 根据架构类型获取提交记录
  static async getSubmissionsByArchitecture(architecture) {
    try {
      const result = await pool.query(`
        SELECT us.*, u.user_name, u.email
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_delete = FALSE 
        AND us.model_info->>'architecture' = $1
        ORDER BY us.id DESC
      `, [architecture]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取架构提交记录失败: ${error.message}`);
    }
  }

  // 获取用户提交统计信息
  static async getSubmissionStats() {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_submissions,
          COUNT(DISTINCT user_id) as unique_users,
          COUNT(DISTINCT model_info->>'architecture') as unique_architectures
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_delete = FALSE
      `);

      return {
        total_submissions: parseInt(result.rows[0].total_submissions),
        unique_users: parseInt(result.rows[0].unique_users),
        unique_architectures: parseInt(result.rows[0].unique_architectures)
      };
    } catch (error) {
      throw new Error(`获取提交统计失败: ${error.message}`);
    }
  }

  // 获取用户最近的提交记录
  static async getRecentSubmissions(limit = 10) {
    try {
      const result = await pool.query(`
        SELECT us.*, u.user_name, u.email
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_delete = FALSE
        ORDER BY us.id DESC
        LIMIT $1
      `, [limit]);
      return result.rows;
    } catch (error) {
      throw new Error(`获取最近提交记录失败: ${error.message}`);
    }
  }

  // 获取所有架构类型
  static async getAllArchitectures() {
    try {
      const result = await pool.query(`
        SELECT DISTINCT model_info->>'architecture' as architecture 
        FROM user_submit 
        WHERE model_info->>'architecture' IS NOT NULL 
        ORDER BY architecture
      `);
      return result.rows.map(row => row.architecture).filter(arch => arch);
    } catch (error) {
      throw new Error(`获取架构类型列表失败: ${error.message}`);
    }
  }

  // 检查用户是否有权限访问提交记录
  static async checkUserPermission(submissionId, userId, userRole) {
    try {
      const result = await pool.query(
        'SELECT user_id FROM user_submit WHERE id = $1',
        [submissionId]
      );
      
      if (!result.rows[0]) {
        return false;
      }
      
      // 管理员可以访问所有记录，普通用户只能访问自己的记录
      return userRole === 'admin' || result.rows[0].user_id === userId;
    } catch (error) {
      throw new Error(`检查用户权限失败: ${error.message}`);
    }
  }

  // 搜索提交记录
  static async searchSubmissions(searchTerm, userId = null, userRole = 'user') {
    try {
      let query = `
        SELECT us.*, u.user_name, u.email
        FROM user_submit us
        JOIN users u ON us.user_id = u.id
        WHERE u.is_delete = FALSE
        AND (
          us.model_info->>'name' ILIKE $1 OR 
          us.model_info->>'architecture' ILIKE $1 OR 
          us.model_info->>'info' ILIKE $1 OR
          u.user_name ILIKE $1
        )
      `;
      let params = [`%${searchTerm}%`];

      // 如果不是管理员，只能搜索自己的提交记录
      if (userRole !== 'admin' && userId) {
        query += ' AND us.user_id = $2';
        params.push(userId);
      }

      query += ' ORDER BY us.id DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error(`搜索提交记录失败: ${error.message}`);
    }
  }
}

module.exports = UserSubmit; 