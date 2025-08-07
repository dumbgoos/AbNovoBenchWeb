const express = require('express');
const router = express.Router();
const DatasetsController = require('../controllers/datasetsController');

// 获取所有数据集（MGF文件列表的别名）
router.get('/', DatasetsController.getAllMGFFiles);

// 获取所有MGF文件列表
router.get('/mgf', DatasetsController.getAllMGFFiles);

// 获取MGF文件预览
router.get('/mgf/:fileId/preview', DatasetsController.getMGFFilePreview);

// 下载MGF文件
router.get('/mgf/:fileId/download', DatasetsController.downloadMGFFile);

module.exports = router; 