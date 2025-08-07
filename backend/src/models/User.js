const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // 获取所有用户
  static async getAllUsers() {
    try {
      const result = await pool.query(
        'SELECT id, user_name, role, email FROM users WHERE is_delete = FALSE ORDER BY id'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`获取用户列表失败: ${error.message}`);
    }
  }

  // 根据ID获取用户
  static async getUserById(id) {
    try {
      const result = await pool.query(
        'SELECT id, user_name, role, email FROM users WHERE id = $1 AND is_delete = FALSE',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`获取用户详情失败: ${error.message}`);
    }
  }

  // 根据用户名获取用户（包含密码，用于登录验证）
  static async getUserByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE user_name = $1 AND is_delete = FALSE',
        [username]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`获取用户失败: ${error.message}`);
    }
  }

  // 根据邮箱获取用户
  static async getUserByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1 AND is_delete = FALSE',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`获取用户失败: ${error.message}`);
    }
  }

  // 创建新用户
  static async createUser(userData) {
    const { user_name, email, password, role = 'user' } = userData;

    try {
      // 检查用户名是否已存在
      const existingUser = await this.getUserByUsername(user_name);
      if (existingUser) {
        throw new Error('用户名已存在');
      }

      // 检查邮箱是否已存在
      const existingEmail = await this.getUserByEmail(email);
      if (existingEmail) {
        throw new Error('邮箱已存在');
      }

      // 加密密码
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const result = await pool.query(
        'INSERT INTO users (user_name, email, pwd, role) VALUES ($1, $2, $3, $4) RETURNING id, user_name, email, role',
        [user_name, email, hashedPassword, role]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }

  // 验证用户密码
  static async validatePassword(username, password) {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.pwd);
      if (isValid) {
        // 返回用户信息（不包含密码）
        return {
          id: user.id,
          user_name: user.user_name,
          email: user.email,
          role: user.role
        };
      }
      return null;
    } catch (error) {
      throw new Error(`验证密码失败: ${error.message}`);
    }
  }

  // 更新用户信息
  static async updateUser(id, userData) {
    const { user_name, email, role } = userData;

    try {
      const result = await pool.query(
        'UPDATE users SET user_name = $1, email = $2, role = $3 WHERE id = $4 AND is_delete = FALSE RETURNING id, user_name, email, role',
        [user_name, email, role, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`更新用户失败: ${error.message}`);
    }
  }

  // 更新用户密码
  static async updatePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const result = await pool.query(
        'UPDATE users SET pwd = $1 WHERE id = $2 AND is_delete = FALSE RETURNING id',
        [hashedPassword, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`更新密码失败: ${error.message}`);
    }
  }

  // 软删除用户
  static async deleteUser(id) {
    try {
      const result = await pool.query(
        'UPDATE users SET is_delete = TRUE WHERE id = $1 RETURNING id',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`删除用户失败: ${error.message}`);
    }
  }

  // 获取用户统计信息
  static async getUserStats() {
    try {
      const result = await pool.query(
        `SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users
         FROM users WHERE is_delete = FALSE`
      );
      return {
        total_users: parseInt(result.rows[0].total_users),
        admin_users: parseInt(result.rows[0].admin_users),
        regular_users: parseInt(result.rows[0].regular_users)
      };
    } catch (error) {
      throw new Error(`获取用户统计失败: ${error.message}`);
    }
  }
}

module.exports = User; 