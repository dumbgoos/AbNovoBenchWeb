const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateUserCreate, validateUserUpdate } = require('../middleware/validation');

// 获取所有用户（需要管理员权限）
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);

// 获取用户详情（需要管理员权限）
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

// 创建用户（需要管理员权限）
router.post('/', authenticateToken, requireAdmin, validateUserCreate, userController.createUser);

// 更新用户（需要管理员权限）
router.put('/:id', authenticateToken, requireAdmin, validateUserUpdate, userController.updateUser);

// 删除用户（需要管理员权限）
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

// 重置用户密码（需要管理员权限）
router.post('/:id/reset-password', authenticateToken, requireAdmin, userController.resetUserPassword);

// 获取用户统计信息（需要管理员权限）
router.get('/stats/overview', authenticateToken, requireAdmin, userController.getUserStats);

// 搜索用户（需要管理员权限）
router.get('/search/query', authenticateToken, requireAdmin, userController.searchUsers);

// 获取用户活动记录（需要管理员权限）
router.get('/:id/activity', authenticateToken, requireAdmin, userController.getUserActivity);

module.exports = router; 