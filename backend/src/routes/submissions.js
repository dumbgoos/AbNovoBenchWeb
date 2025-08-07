const express = require('express');
const router = express.Router();
const submissionsController = require('../controllers/submissionsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadFiles, handleUploadErrors } = require('../middleware/upload');
const { validateSubmissionCreation, validateSubmissionUpdate } = require('../middleware/validation');

// 应用认证中间件到所有路由
router.use(authenticateToken);

// 获取所有提交记录 (管理员)
router.get('/', requireAdmin, submissionsController.getAllSubmissions);

// 获取提交统计信息 - 必须在 /:id 之前
router.get('/stats/overview', submissionsController.getSubmissionStats);

// 获取最近的提交记录 - 必须在 /:id 之前
router.get('/recent/list', submissionsController.getRecentSubmissions);

// 获取所有架构类型 - 必须在 /:id 之前
router.get('/architectures/list', submissionsController.getAllArchitectures);

// 搜索提交记录 - 必须在 /:id 之前
router.get('/search/query', submissionsController.searchSubmissions);

// 获取当前用户的提交记录 - 必须在 /:id 之前
router.get('/my/submissions', submissionsController.getMySubmissions);

// 根据架构获取提交记录 - 必须在 /:id 之前
router.get('/architecture/:architecture', submissionsController.getSubmissionsByArchitecture);

// 获取当前用户的提交记录 - 必须在 /:id 之前
router.get('/user/:userId', submissionsController.getSubmissionsByUser);

// 获取单个提交记录 - 放在具体路径之后
router.get('/:id', submissionsController.getSubmissionById);

// 创建新的提交记录 (支持文件上传)
router.post('/', 
  uploadFiles, 
  handleUploadErrors,
  validateSubmissionCreation,
  submissionsController.createSubmission
);

// 更新提交记录 (支持文件上传)
router.put('/:id', 
  uploadFiles, 
  handleUploadErrors,
  validateSubmissionUpdate,
  submissionsController.updateSubmission
);

// 删除提交记录
router.delete('/:id', submissionsController.deleteSubmission);

// 下载文件 - 具体路径，放在 /:id 之后也可以
router.get('/:id/download/:type', submissionsController.downloadFile);

module.exports = router; 