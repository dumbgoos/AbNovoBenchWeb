const express = require('express');
const router = express.Router();
const depthController = require('../controllers/depthController');

// 获取所有depth数据
router.get('/', depthController.getAllDepthData);

// 根据抗体名称获取depth数据
router.get('/:antibody', depthController.getDepthDataByAntibody);

module.exports = router; 