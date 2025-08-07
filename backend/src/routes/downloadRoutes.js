const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');

// 下载模型代码文件
router.get('/models/:id/code', downloadController.downloadModelCode);

// 下载模型检查点文件
router.get('/models/:id/checkpoint', downloadController.downloadModelCheckpoint);

// 获取模型文件信息
router.get('/models/:id/info', downloadController.getModelFileInfo);

module.exports = router; 