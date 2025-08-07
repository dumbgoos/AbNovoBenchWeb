const express = require('express');
const router = express.Router();

// 导入现有的控制器
const metricController = require('../controllers/metricController');

// 获取排行榜数据
router.get('/', metricController.allController.getLeaderboard);

// 获取排行榜统计数据
router.get('/stats', metricController.allController.getStats);

module.exports = router;