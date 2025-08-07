const path = require('path');
const fs = require('fs').promises;
const archiver = require('archiver');
const Model = require('../models/Model');

// 下载模型代码文件
const downloadModelCode = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取模型信息
    const model = await Model.getModelById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    if (!model.code_path) {
      return res.status(404).json({
        success: false,
        message: '代码文件路径不存在'
      });
    }

    // 转换路径以适应Docker容器环境
    const actualCodePath = process.env.NODE_ENV === 'production' 
      ? model.code_path.replace('/root/abnovobench/data', '/app/data')
      : model.code_path;

    // 检查文件/目录是否存在
    let codeStat;
    try {
      codeStat = await fs.stat(actualCodePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '代码文件不存在'
      });
    }

    const sanitizedModelName = model.name.replace(/[^a-zA-Z0-9]/g, '_');
    
    // 记录下载日志
    console.log(`📥 Code download requested: Model ${model.name} (ID: ${id}) by user ${req.user?.id || 'anonymous'}`);

    // 如果是目录，创建ZIP文件
    if (codeStat.isDirectory()) {
      const downloadFileName = `${sanitizedModelName}_code.zip`;
      
      // 设置下载响应头
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
      res.setHeader('Content-Type', 'application/zip');

      // 创建zip流
      const archive = archiver('zip', {
        zlib: { level: 9 } // 最高压缩级别
      });

      // 处理错误
      archive.on('error', (err) => {
        console.error('创建ZIP文件错误:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: '创建压缩文件失败'
          });
        }
      });

      // 将archive输出流连接到响应
      archive.pipe(res);

      // 添加整个目录到zip
      archive.directory(actualCodePath, false);

      // 完成压缩
      await archive.finalize();
      
    } else {
      // 如果是文件，直接发送
      const fileName = path.basename(actualCodePath);
      const downloadFileName = `${sanitizedModelName}_code_${fileName}`;

      // 设置下载响应头
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
      res.setHeader('Content-Type', 'application/octet-stream');

      // 发送文件
      return res.sendFile(path.resolve(actualCodePath));
    }

  } catch (error) {
    console.error('下载模型代码错误:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: '下载失败'
      });
    }
  }
};

// 下载模型检查点文件
const downloadModelCheckpoint = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取模型信息
    const model = await Model.getModelById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    if (!model.checkpoint_path) {
      return res.status(404).json({
        success: false,
        message: '检查点文件路径不存在'
      });
    }

    // 检查文件是否存在
    try {
      await fs.access(model.checkpoint_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: '检查点文件不存在'
      });
    }

    // 获取文件信息
    const fileName = path.basename(model.checkpoint_path);
    const sanitizedModelName = model.name.replace(/[^a-zA-Z0-9]/g, '_');
    const downloadFileName = `${sanitizedModelName}_checkpoint_${fileName}`;

    // 设置下载响应头
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // 记录下载日志
    console.log(`📥 Checkpoint download requested: Model ${model.name} (ID: ${id}) by user ${req.user?.id || 'anonymous'}`);

    // 发送文件
    return res.sendFile(path.resolve(model.checkpoint_path));

  } catch (error) {
    console.error('下载模型检查点错误:', error);
    res.status(500).json({
      success: false,
      message: '下载失败'
    });
  }
};

// 获取模型文件信息（不下载）
const getModelFileInfo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 获取模型信息
    const model = await Model.getModelById(id);
    if (!model) {
      return res.status(404).json({
        success: false,
        message: '模型不存在'
      });
    }

    // 转换路径以适应Docker容器环境
    const actualCodePath = model.code_path && process.env.NODE_ENV === 'production' 
      ? model.code_path.replace('/root/abnovobench/data', '/app/data')
      : model.code_path;

    const fileInfo = {
      modelId: model.id,
      modelName: model.name,
      files: {
        code: null,
        checkpoint: null
      }
    };

    // 检查代码文件
    if (actualCodePath) {
      try {
        const codeStats = await fs.stat(actualCodePath);
        fileInfo.files.code = {
          path: path.basename(actualCodePath),
          size: codeStats.size,
          sizeFormatted: formatFileSize(codeStats.size),
          lastModified: codeStats.mtime,
          available: true
        };
      } catch (error) {
        fileInfo.files.code = {
          path: path.basename(actualCodePath),
          available: false,
          error: '文件不存在'
        };
      }
    }

    // 检查检查点文件
    if (model.checkpoint_path) {
      try {
        const checkpointStats = await fs.stat(model.checkpoint_path);
        fileInfo.files.checkpoint = {
          path: path.basename(model.checkpoint_path),
          size: checkpointStats.size,
          sizeFormatted: formatFileSize(checkpointStats.size),
          lastModified: checkpointStats.mtime,
          available: true
        };
      } catch (error) {
        fileInfo.files.checkpoint = {
          path: path.basename(model.checkpoint_path),
          available: false,
          error: '文件不存在'
        };
      }
    }

    res.json({
      success: true,
      data: fileInfo
    });

  } catch (error) {
    console.error('获取模型文件信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文件信息失败'
    });
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  downloadModelCode,
  downloadModelCheckpoint,
  getModelFileInfo
}; 