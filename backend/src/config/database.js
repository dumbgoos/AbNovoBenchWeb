const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 50, // 增加最大连接数以支持更高并发
  idleTimeoutMillis: 60000, // 增加空闲连接超时时间
  connectionTimeoutMillis: 10000, // 增加连接超时时间到10秒
  acquireTimeoutMillis: 60000, // 添加获取连接的超时时间
  maxUses: 7500, // 添加连接的最大使用次数
});

// 测试数据库连接
pool.on('connect', () => {
  console.log('✅ 数据库连接成功');
});

pool.on('error', (err) => {
  console.error('❌ 数据库连接错误:', err);
  process.exit(-1);
});

// 添加连接池状态监控
pool.on('acquire', () => {
  console.log('🔗 数据库连接被获取');
});

pool.on('release', () => {
  console.log('🔓 数据库连接被释放');
});

module.exports = pool; 