const UserSubmit = require('../models/UserSubmit');
const path = require('path');
const fs = require('fs');

// 获取所有提交记录
const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const allSubmissions = await UserSubmit.getAllSubmissions();
    const paginatedSubmissions = allSubmissions.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        submissions: paginatedSubmissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allSubmissions.length,
          pages: Math.ceil(allSubmissions.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 根据用户ID获取提交记录
const getSubmissionsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const submissions = await UserSubmit.getSubmissionsByUserId(parseInt(userId));
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('获取用户提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取当前用户的提交记录
const getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
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
    console.error('获取我的提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 根据ID获取单个提交记录
const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submission = await UserSubmit.getSubmissionById(parseInt(id));
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 检查用户权限
    const hasPermission = await UserSubmit.checkUserPermission(
      parseInt(id), 
      req.user.id, 
      req.user.role
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '没有权限访问该记录'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('获取提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 创建新的提交记录
const createSubmission = async (req, res) => {
  try {
    // 详细的请求信息日志
    console.log('📋 createSubmission 请求详情:');
    console.log('- Headers:', req.headers);
    console.log('- User info:', req.user);
    console.log('- Body:', req.body);
    console.log('- Files:', req.files);
    
    // 验证用户信息
    if (!req.user) {
      console.error('❌ 用户未认证 - req.user 为空');
      return res.status(401).json({
        success: false,
        message: '用户未认证，请重新登录'
      });
    }
    
    if (!req.user.id) {
      console.error('❌ 用户ID缺失 - req.user.id 为空');
      return res.status(401).json({
        success: false,
        message: '用户信息不完整，请重新登录'
      });
    }
    
    console.log('✅ 用户认证成功 - User ID:', req.user.id);

    const { code_url, model_info } = req.body;
    
    // 处理上传的文件
    let code_path = null;
    let model_path = null;
    
    if (req.files) {
      // 代码文件路径
      if (req.files.codeFile) {
        code_path = req.files.codeFile[0].path;
      }
      
      // 模型文件路径  
      if (req.files.modelFile) {
        model_path = req.files.modelFile[0].path;
      }
    }

    // 解析model_info JSON
    let parsedModelInfo = null;
    if (model_info) {
      try {
        parsedModelInfo = JSON.parse(model_info);
        console.log('✅ 模型信息解析成功:', parsedModelInfo);
      } catch (error) {
        console.error('❌ 模型信息JSON解析失败:', error.message);
        return res.status(400).json({
          success: false,
          message: '模型信息JSON格式不正确'
        });
      }
    }

    const submissionData = {
      user_id: req.user.id,
      code_url: code_url || null,
      code_path: code_path,
      model_path: model_path,
      model_info: parsedModelInfo
    };
    
    console.log('📊 准备保存的提交数据:', submissionData);

    const newSubmission = await UserSubmit.createSubmission(submissionData);
    console.log('✅ 提交记录创建成功:', newSubmission);

    res.status(201).json({
      success: true,
      message: '提交记录创建成功',
      data: newSubmission
    });
  } catch (error) {
    console.error('❌ 创建提交记录失败:', error);
    console.error('Error stack:', error.stack);
    
    // 如果创建失败，删除已上传的文件
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 更新提交记录
const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { code_url, model_info } = req.body;

    // 检查用户权限
    const hasPermission = await UserSubmit.checkUserPermission(
      parseInt(id), 
      req.user.id, 
      req.user.role
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '没有权限修改该记录'
      });
    }

    // 获取现有记录
    const existingSubmission = await UserSubmit.getSubmissionById(parseInt(id));
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 处理上传的文件
    let code_path = existingSubmission.code_path;
    let model_path = existingSubmission.model_path;
    
    if (req.files) {
      // 如果有新的代码文件，删除旧文件并更新路径
      if (req.files.codeFile) {
        if (existingSubmission.code_path && fs.existsSync(existingSubmission.code_path)) {
          fs.unlinkSync(existingSubmission.code_path);
        }
        code_path = req.files.codeFile[0].path;
      }
      
      // 如果有新的模型文件，删除旧文件并更新路径
      if (req.files.modelFile) {
        if (existingSubmission.model_path && fs.existsSync(existingSubmission.model_path)) {
          fs.unlinkSync(existingSubmission.model_path);
        }
        model_path = req.files.modelFile[0].path;
      }
    }

    // 解析model_info JSON
    let parsedModelInfo = existingSubmission.model_info;
    if (model_info) {
      try {
        parsedModelInfo = JSON.parse(model_info);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: '模型信息JSON格式不正确'
        });
      }
    }

    const updateData = {
      code_url: code_url !== undefined ? code_url : existingSubmission.code_url,
      code_path: code_path,
      model_path: model_path,
      model_info: parsedModelInfo
    };

    const updatedSubmission = await UserSubmit.updateSubmission(parseInt(id), updateData);

    res.json({
      success: true,
      message: '提交记录更新成功',
      data: updatedSubmission
    });
  } catch (error) {
    console.error('更新提交记录失败:', error);
    
    // 如果更新失败，删除新上传的文件
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 删除提交记录
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查用户权限
    const hasPermission = await UserSubmit.checkUserPermission(
      parseInt(id), 
      req.user.id, 
      req.user.role
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '没有权限删除该记录'
      });
    }

    // 获取记录以删除关联文件
    const submission = await UserSubmit.getSubmissionById(parseInt(id));
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    // 删除关联的文件
    if (submission.code_path && fs.existsSync(submission.code_path)) {
      fs.unlinkSync(submission.code_path);
    }
    if (submission.model_path && fs.existsSync(submission.model_path)) {
      fs.unlinkSync(submission.model_path);
    }

    const deletedSubmission = await UserSubmit.deleteSubmission(parseInt(id));

    res.json({
      success: true,
      message: '提交记录删除成功',
      data: deletedSubmission
    });
  } catch (error) {
    console.error('删除提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 根据架构获取提交记录
const getSubmissionsByArchitecture = async (req, res) => {
  try {
    const { architecture } = req.params;
    const submissions = await UserSubmit.getSubmissionsByArchitecture(architecture);
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('获取架构提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取提交统计信息
const getSubmissionStats = async (req, res) => {
  try {
    const stats = await UserSubmit.getSubmissionStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取提交统计失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取最近的提交记录
const getRecentSubmissions = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const submissions = await UserSubmit.getRecentSubmissions(limit);
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('获取最近提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 获取所有架构类型
const getAllArchitectures = async (req, res) => {
  try {
    const architectures = await UserSubmit.getAllArchitectures();
    res.json({
      success: true,
      data: architectures
    });
  } catch (error) {
    console.error('获取架构类型失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 搜索提交记录
const searchSubmissions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '搜索关键词不能为空'
      });
    }

    const submissions = await UserSubmit.searchSubmissions(
      q.trim(),
      req.user.id,
      req.user.role
    );
    
    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('搜索提交记录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 下载文件
const downloadFile = async (req, res) => {
  try {
    const { id, type } = req.params; // type: 'code' or 'model'
    
    // 检查用户权限
    const hasPermission = await UserSubmit.checkUserPermission(
      parseInt(id), 
      req.user.id, 
      req.user.role
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: '没有权限访问该文件'
      });
    }

    const submission = await UserSubmit.getSubmissionById(parseInt(id));
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: '提交记录不存在'
      });
    }

    let filePath;
    let fileName;
    
    if (type === 'code') {
      filePath = submission.code_path;
      fileName = `code_${id}.zip`;
    } else if (type === 'model') {
      filePath = submission.model_path;
      fileName = `model_${id}.zip`;
    } else {
      return res.status(400).json({
        success: false,
        message: '文件类型无效'
      });
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: '文件不存在'
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('下载文件失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllSubmissions,
  getSubmissionsByUser,
  getMySubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
  getSubmissionsByArchitecture,
  getSubmissionStats,
  getRecentSubmissions,
  getAllArchitectures,
  searchSubmissions,
  downloadFile
}; 