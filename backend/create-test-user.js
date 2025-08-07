const pool = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  try {
    console.log('🔄 创建测试用户...');
    
    // 检查用户是否已存在
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE user_name = $1',
      ['apitest']
    );
    
    if (existingUser.rows.length > 0) {
      console.log('ℹ️ 测试用户已存在，删除旧用户...');
      await pool.query('DELETE FROM users WHERE user_name = $1', ['apitest']);
    }
    
    // 创建新用户
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const result = await pool.query(
      'INSERT INTO users (user_name, email, pwd, role, is_delete) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_name, email, role',
      ['apitest', 'apitest@example.com', hashedPassword, 'user', false]
    );
    
    console.log('✅ 测试用户创建成功:', result.rows[0]);
    console.log('用户名: apitest');
    console.log('密码: test123');
    
  } catch (error) {
    console.error('❌ 创建测试用户失败:', error.message);
  } finally {
    await pool.end();
  }
}

createTestUser(); 