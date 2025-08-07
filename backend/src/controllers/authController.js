const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT令牌
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 用户注册
const register = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // 创建用户
    const user = await User.createUser({
      user_name: username,
      email,
      password,
      role
    });

    // 生成令牌
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: '用户注册成功',
      data: {
        user: {
          id: user.id,
          username: user.user_name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        },
        token
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    
    if (error.message.includes('用户名已存在')) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    
    if (error.message.includes('邮箱已存在')) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证用户名和密码
    const user = await User.validatePassword(username, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 生成令牌
    const token = generateToken(user.id);

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          username: user.user_name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
};

// 验证令牌
const verifyToken = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '令牌验证成功',
      data: {
        user: {
          id: user.id,
          username: user.user_name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('令牌验证错误:', error);
    res.status(500).json({
      success: false,
      message: '令牌验证失败'
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    res.json({
      success: true,
      message: '获取用户信息成功',
      data: {
        user: {
          id: user.id,
          username: user.user_name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
};

// 更新用户信息
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user.id;

    // 检查用户是否存在
    const existingUser = await User.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 检查用户名是否被其他用户使用
    if (username && username !== existingUser.user_name) {
      const duplicateUser = await User.getUserByUsername(username);
      if (duplicateUser && duplicateUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }

    // 检查邮箱是否被其他用户使用
    if (email && email !== existingUser.email) {
      const duplicateEmail = await User.getUserByEmail(email);
      if (duplicateEmail && duplicateEmail.id !== userId) {
        return res.status(400).json({
          success: false,
          message: '邮箱已存在'
        });
      }
    }

    // 准备更新数据，如果没有提供新值则使用现有值
    const updateData = {
      user_name: username || existingUser.user_name,
      email: email || existingUser.email,
      role: existingUser.role  // 保持现有角色不变
    };

    // 更新用户信息
    const updatedUser = await User.updateUser(userId, updateData);

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.user_name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    
    if (error.message.includes('用户名已存在')) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }
    
    if (error.message.includes('邮箱已存在')) {
      return res.status(400).json({
        success: false,
        message: '邮箱已存在'
      });
    }

    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
};

// 更新密码
const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 验证当前密码
    const user = await User.validatePassword(req.user.user_name, currentPassword);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    await User.updatePassword(userId, newPassword);

    res.json({
      success: true,
      message: '密码更新成功'
    });
  } catch (error) {
    console.error('更新密码错误:', error);
    res.status(500).json({
      success: false,
      message: '更新密码失败'
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  getCurrentUser,
  updateProfile,
  updatePassword
}; 