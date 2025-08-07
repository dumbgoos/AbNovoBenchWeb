const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 安全中间件
app.use(helmet());

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
      'http://localhost:3000',
  'http://localhost:3001',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 请求日志
app.use(morgan('combined'));

// 限流中间件 - 开发环境下放宽限制
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 开发环境1分钟窗口
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 开发环境允许更多请求
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 导入路由
const authRoutes = require('./routes/auth');
const modelRoutes = require('./routes/models');
const userRoutes = require('./routes/users');
const metricRoutes = require('./routes/metrics');
const submissionRoutes = require('./routes/submissions');
const downloadRoutes = require('./routes/downloadRoutes');
const datasetsRoutes = require('./routes/datasets');
const dataRequestRoutes = require('./routes/dataRequests');
const efficiencyRoutes = require('./routes/efficiency');
const depthRoutes = require('./routes/depth');
const robustnessRoutes = require('./routes/robustness');
const assemblyRoutes = require('./routes/assembly');
const leaderboardRoutes = require('./routes/leaderboard');
const evaluationRoutes = require('./routes/evaluation');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/metrics', metricRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/datasets', datasetsRoutes);
app.use('/api/data-requests', dataRequestRoutes);
app.use('/api/efficiency', efficiencyRoutes);
app.use('/api/depth', depthRoutes);
app.use('/api/robustness', robustnessRoutes);
app.use('/api/assembly', assemblyRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/evaluation', evaluationRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ABNovoBench API 服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404错误处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '请求的资源不存在'
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('全局错误:', error);
  
  // 数据库连接错误
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: '数据库连接失败'
    });
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: '令牌无效'
    });
  }
  
  // 验证错误
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: error.details
    });
  }
  
  // 默认错误
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 启动服务器
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0'; // 监听所有网络接口

app.listen(PORT, HOST, () => {
  console.log(`🚀 ABNovoBench API 服务启动成功`);
  console.log(`📡 服务器运行在: ${HOST}:${PORT}`);
  console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API地址: http://${HOST}:${PORT}/api`);
  console.log(`💚 健康检查: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 外部访问: http://localhost:${PORT}/api`);
});

module.exports = app; 