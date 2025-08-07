const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordUpdate
} = require('../middleware/validation');

// 用户注册
router.post('/register', validateUserRegistration, authController.register);

// 用户登录
router.post('/login', validateUserLogin, authController.login);

// 验证令牌
router.get('/verify', authenticateToken, authController.verifyToken);

// 获取当前用户信息
router.get('/me', authenticateToken, authController.getCurrentUser);

// 更新用户信息
router.put('/profile', authenticateToken, validateUserUpdate, authController.updateProfile);

// 更新密码
router.put('/password', authenticateToken, validatePasswordUpdate, authController.updatePassword);

module.exports = router; 