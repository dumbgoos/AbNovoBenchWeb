const pool = require('./src/config/database');

async function checkUsers() {
  try {
    console.log('🔍 检查数据库中的用户...');
    
    const result = await pool.query(`
      SELECT id, user_name, email, role, is_delete 
      FROM users 
      ORDER BY id
    `);
    
    console.log('📋 用户列表:');
    if (result.rows.length === 0) {
      console.log('❌ 数据库中没有用户');
    } else {
      result.rows.forEach(user => {
        console.log(`- ID: ${user.id}, 用户名: ${user.user_name}, 邮箱: ${user.email}, 角色: ${user.role}, 删除: ${user.is_delete}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查用户失败:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsers(); 