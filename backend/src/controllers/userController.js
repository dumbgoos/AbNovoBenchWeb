const User = require('../models/User');
const UserSubmit = require('../models/UserSubmit');

// 获取所有用户（管理员权限）
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const users = await User.getAllUsers();
    const paginatedUsers = users.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        users: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length,
          pages: Math.ceil(users.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 根据ID获取用户
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户的提交记录
    const submissions = await UserSubmit.getSubmissionsByUserId(id);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          user_name: user.user_name,
          email: user.email,
          role: user.role
        },
        submissions
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建新用户（管理员权限）
const createUser = async (req, res) => {
  try {
    const { user_name, email, pwd, role = 'user' } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.getUserByUsername(user_name);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '邮箱已被使用'
      });
    }

    const newUser = await User.createUser({
      user_name,
      email,
      password: pwd,
      role
    });

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: {
        user: {
          id: newUser.id,
          user_name: newUser.user_name,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新用户信息（管理员权限）
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_name, email, role } = req.body;

    const existingUser = await User.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 如果更新用户名，检查是否已存在
    if (user_name && user_name !== existingUser.user_name) {
      const duplicateUser = await User.getUserByUsername(user_name);
      if (duplicateUser) {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        });
      }
    }

    // 如果更新邮箱，检查是否已存在
    if (email && email !== existingUser.email) {
      const duplicateEmail = await User.getUserByEmail(email);
      if (duplicateEmail) {
        return res.status(400).json({
          success: false,
          message: '邮箱已被使用'
        });
      }
    }

    const updatedUser = await User.updateUser(id, {
      user_name,
      email,
      role
    });

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: {
          id: updatedUser.id,
          user_name: updatedUser.user_name,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除用户（管理员权限）
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const existingUser = await User.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 防止删除自己
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: '不能删除自己的账户'
      });
    }

    await User.deleteUser(id);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 重置用户密码（管理员权限）
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingUser = await User.getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 生成随机密码
    const newPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    
    await User.updatePassword(id, newPassword);

    res.json({
      success: true,
      message: '密码重置成功',
      data: {
        newPassword: newPassword
      }
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户统计信息
const getUserStats = async (req, res) => {
  try {
    const stats = await User.getUserStats();

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 搜索用户
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const users = await User.getAllUsers();
    const filteredUsers = users.filter(user => 
      user.user_name.toLowerCase().includes(q.toLowerCase()) ||
      user.email.toLowerCase().includes(q.toLowerCase())
    );

    res.json({
      success: true,
      data: {
        users: filteredUsers,
        total: filteredUsers.length
      }
    });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取用户活动记录
const getUserActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const user = await User.getUserById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取用户最近的提交记录
    const submissions = await UserSubmit.getSubmissionsByUserId(id);
    const recentSubmissions = submissions.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          user_name: user.user_name,
          email: user.email,
          role: user.role
        },
        recent_activity: recentSubmissions
      }
    });
  } catch (error) {
    console.error('获取用户活动记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats,
  searchUsers,
  getUserActivity
}; 