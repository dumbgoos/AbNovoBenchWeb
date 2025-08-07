const express = require('express');
const router = express.Router();
const robustnessController = require('../controllers/robustnessController');

// 获取所有indicators列表
router.get('/indicators', robustnessController.getAllIndicators);

// 获取所有robustness数据（向后兼容）
router.get('/', robustnessController.getAllRobustnessData);

// 获取特定indicator的数据
router.get('/indicator/:indicatorKey', robustnessController.getIndicatorData);

// 获取特定indicator和工具的数据
router.get('/indicator/:indicatorKey/tool/:toolName', robustnessController.getIndicatorByTool);

// 获取特定工具的robustness数据（向后兼容）
router.get('/:toolName', robustnessController.getRobustnessByTool);

module.exports = router; 