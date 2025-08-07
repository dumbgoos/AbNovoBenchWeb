const express = require('express');
const router = express.Router();
const efficiencyController = require('../controllers/efficiencyController');

// 获取所有efficiency数据
router.get('/', efficiencyController.getAllEfficiency);

// 根据模型名称获取efficiency数据
router.get('/:modelName', efficiencyController.getEfficiencyByModel);

module.exports = router; 