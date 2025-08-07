const pool = require('./src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔄 测试数据库连接...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 数据库连接成功:', result.rows[0]);
    
    // 测试 user_submit 表是否存在
    console.log('🔄 检查 user_submit 表...');
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'user_submit'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ user_submit 表不存在');
      return;
    }
    
    console.log('✅ user_submit 表存在');
    
    // 检查表结构
    console.log('🔄 检查表结构...');
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_submit'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 user_submit 表结构:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection(); 