const UserSubmit = require('../models/UserSubmit');
const User = require('../models/User');

// 获取所有提交记录
const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10, architecture, userId } = req.query;
    const offset = (page - 1) * limit;

    let submissions;
    if (architecture) {
      submissions = await UserSubmit.getSubmissionsByArchitecture(architecture);
    } else if (userId) {
      submissions = await UserSubmit.getSubmissionsByUserId(userId);
    } else {
      submissions = await UserSubmit.getAllSubmissions();
    }

    const paginatedSubmissions = submissions.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: submissions.length,
          pages: Math.ceil(submissions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 根据ID获取提交记录
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await UserSubmit.getSubmissionById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 检查权限
    const hasPermission = await UserSubmit.checkUserPermission(id, req.user.id, req.user.role);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '无权访问此提交记录'
      });
    }

    res.json({
      success: true,
      data: {
        submission
      }
    });
  } catch (error) {
    console.error('获取提交记录详情错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 创建新的提交记录
const createSubmission = async (req, res) => {
  try {
    const submissionData = {
      ...req.body,
      user_id: req.user.id // 使用当前登录用户的ID
    };

    const newSubmission = await UserSubmit.createSubmission(submissionData);

    res.status(201).json({
      success: true,
      message: '提交记录创建成功',
      data: {
        submission: newSubmission
      }
    });
  } catch (error) {
    console.error('创建提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 更新提交记录
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const submissionData = req.body;

    const existingSubmission = await UserSubmit.getSubmissionById(id);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 检查权限
    const hasPermission = await UserSubmit.checkUserPermission(id, req.user.id, req.user.role);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '无权修改此提交记录'
      });
    }

    const updatedSubmission = await UserSubmit.updateSubmission(id, submissionData);

    res.json({
      success: true,
      message: '提交记录更新成功',
      data: {
        submission: updatedSubmission
      }
    });
  } catch (error) {
    console.error('更新提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 删除提交记录
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const existingSubmission = await UserSubmit.getSubmissionById(id);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 检查权限
    const hasPermission = await UserSubmit.checkUserPermission(id, req.user.id, req.user.role);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '无权删除此提交记录'
      });
    }

    await UserSubmit.deleteSubmission(id);

    res.json({
      success: true,
      message: '提交记录删除成功'
    });
  } catch (error) {
    console.error('删除提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取当前用户的提交记录
const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const submissions = await UserSubmit.getSubmissionsByUserId(req.user.id);
    const paginatedSubmissions = submissions.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: submissions.length,
          pages: Math.ceil(submissions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取我的提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 根据架构获取提交记录
const getSubmissionsByArchitecture = async (req, res) => {
  try {
    const { architecture } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const submissions = await UserSubmit.getSubmissionsByArchitecture(architecture);
    const paginatedSubmissions = submissions.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        architecture,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: submissions.length,
          pages: Math.ceil(submissions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取架构提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取提交统计信息
const getSubmissionStats = async (req, res) => {
  try {
    const stats = await UserSubmit.getSubmissionStats();

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('获取提交统计错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取最近的提交记录
const getRecentSubmissions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const submissions = await UserSubmit.getRecentSubmissions(limit);

    res.json({
      success: true,
      data: {
        submissions
      }
    });
  } catch (error) {
    console.error('获取最近提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 获取所有架构类型
const getAllArchitectures = async (req, res) => {
  try {
    const architectures = await UserSubmit.getAllArchitectures();

    res.json({
      success: true,
      data: {
        architectures
      }
    });
  } catch (error) {
    console.error('获取架构类型错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 搜索提交记录
const searchSubmissions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const submissions = await UserSubmit.searchSubmissions(q, req.user.id, req.user.role);

    res.json({
      success: true,
      data: {
        submissions,
        total: submissions.length
      }
    });
  } catch (error) {
    console.error('搜索提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

// 批量删除提交记录（管理员权限）
const batchDeleteSubmissions = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: '请提供要删除的提交记录ID数组'
      });
    }

    const deletedCount = await Promise.all(
      ids.map(async (id) => {
        try {
          await UserSubmit.deleteSubmission(id);
          return 1;
        } catch (error) {
          console.error(`删除提交记录 ${id} 失败:`, error);
          return 0;
        }
      })
    );

    const successCount = deletedCount.reduce((sum, count) => sum + count, 0);

    res.json({
      success: true,
      message: `成功删除 ${successCount} 条提交记录`,
      data: {
        total: ids.length,
        success: successCount,
        failed: ids.length - successCount
      }
    });
  } catch (error) {
    console.error('批量删除提交记录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getMySubmissions,
  getSubmissionsByArchitecture,
  getSubmissionStats,
  getRecentSubmissions,
  getAllArchitectures,
  searchSubmissions,
  batchDeleteSubmissions
}; 