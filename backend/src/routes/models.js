const express = require('express');
const router = express.Router();
const modelController = require('../controllers/modelController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateModelCreate, validateModelUpdate } = require('../middleware/validation');

// 获取所有模型
router.get('/', modelController.getAllModels);

// 获取模型详情
router.get('/:id', modelController.getModelById);

// 创建模型（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, validateModelCreate, modelController.createModel);

// 更新模型（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, validateModelUpdate, modelController.updateModel);

// 删除模型（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, modelController.deleteModel);

// 获取模型统计信息
router.get('/stats/overview', modelController.getModelStats);

// 根据架构搜索模型
router.get('/search/architecture', modelController.searchModelsByArchitecture);

module.exports = router; 