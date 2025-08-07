const pool = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('🔍 测试数据库连接...');
    
    // 测试基本连接
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ 数据库连接成功!');
    console.log('📅 当前时间:', result.rows[0].now);
    console.log('🗄️  数据库版本:', result.rows[0].version);
    
    // 测试表是否存在
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 数据库表:');
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // 测试用户表
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`👥 用户数量: ${userCount.rows[0].count}`);
    
    console.log('🎉 数据库测试完成!');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase(); 