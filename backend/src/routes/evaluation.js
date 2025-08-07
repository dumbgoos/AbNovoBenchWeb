const express = require('express');
const router = express.Router();

// 导入现有的控制器
const modelController = require('../controllers/modelController');

// 获取evaluation用的模型列表（包含accuracy数据）
router.get('/models', modelController.getEvaluationModels);

module.exports = router;