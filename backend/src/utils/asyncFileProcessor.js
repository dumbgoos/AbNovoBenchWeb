const fs = require('fs').promises;
const path = require('path');
const { Worker } = require('worker_threads');

class AsyncFileProcessor {
  constructor() {
    this.processingQueue = new Map();
    this.workers = new Map();
  }

  // 异步处理文件上传
  async processFileUpload(fileInfo, userId) {
    const processId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`🚀 Starting async file processing: ${processId}`);
    
    // 立即返回处理ID，不等待完成
    this.processingQueue.set(processId, {
      status: 'processing',
      startTime: Date.now(),
      fileInfo,
      userId
    });

    // 异步处理文件
    this.processFileInBackground(processId, fileInfo, userId);

    return {
      processId,
      status: 'processing',
      message: '文件正在后台处理中，请稍后查询处理状态'
    };
  }

  // 后台处理文件
  async processFileInBackground(processId, fileInfo, userId) {
    try {
      console.log(`📁 Processing file in background: ${processId}`);
      
      const results = await Promise.all([
        this.validateFile(fileInfo),
        this.compressFile(fileInfo),
        this.scanFile(fileInfo)
      ]);

      const [validation, compression, scan] = results;

      // 更新处理状态
      this.processingQueue.set(processId, {
        status: 'completed',
        startTime: this.processingQueue.get(processId).startTime,
        endTime: Date.now(),
        fileInfo,
        userId,
        results: {
          validation,
          compression,
          scan
        }
      });

      console.log(`✅ File processing completed: ${processId}`);
    } catch (error) {
      console.error(`❌ File processing failed: ${processId}`, error);
      
      this.processingQueue.set(processId, {
        status: 'failed',
        startTime: this.processingQueue.get(processId).startTime,
        endTime: Date.now(),
        fileInfo,
        userId,
        error: error.message
      });
    }
  }

  // 验证文件
  async validateFile(fileInfo) {
    // 模拟文件验证过程
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const allowedTypes = ['.zip', '.tar.gz', '.py', '.pkl', '.pth'];
    const fileExt = path.extname(fileInfo.originalname);
    
    if (!allowedTypes.includes(fileExt)) {
      throw new Error(`不支持的文件类型: ${fileExt}`);
    }

    return {
      valid: true,
      fileType: fileExt,
      fileSize: fileInfo.size
    };
  }

  // 压缩文件
  async compressFile(fileInfo) {
    // 模拟文件压缩过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      compressed: true,
      originalSize: fileInfo.size,
      compressedSize: Math.floor(fileInfo.size * 0.7), // 模拟压缩率
      compressionRatio: 0.3
    };
  }

  // 扫描文件安全性
  async scanFile(fileInfo) {
    // 模拟文件安全扫描
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      safe: true,
      threats: [],
      scanTime: 1500
    };
  }

  // 获取处理状态
  getProcessingStatus(processId) {
    const processing = this.processingQueue.get(processId);
    
    if (!processing) {
      return {
        status: 'not_found',
        message: '处理记录不存在'
      };
    }

    const result = {
      processId,
      status: processing.status,
      startTime: processing.startTime
    };

    if (processing.endTime) {
      result.endTime = processing.endTime;
      result.duration = processing.endTime - processing.startTime;
    }

    if (processing.status === 'completed') {
      result.results = processing.results;
    } else if (processing.status === 'failed') {
      result.error = processing.error;
    }

    return result;
  }

  // 获取用户的所有处理任务
  getUserProcessingTasks(userId) {
    const userTasks = [];
    
    for (const [processId, processing] of this.processingQueue.entries()) {
      if (processing.userId === userId) {
        userTasks.push({
          processId,
          status: processing.status,
          startTime: processing.startTime,
          endTime: processing.endTime,
          fileInfo: {
            originalname: processing.fileInfo.originalname,
            size: processing.fileInfo.size
          }
        });
      }
    }

    return userTasks.sort((a, b) => b.startTime - a.startTime);
  }

  // 清理完成的任务（定期清理）
  cleanupCompletedTasks() {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24小时前
    
    for (const [processId, processing] of this.processingQueue.entries()) {
      if (processing.endTime && processing.endTime < cutoffTime) {
        this.processingQueue.delete(processId);
        console.log(`🗑️ Cleaned up old processing task: ${processId}`);
      }
    }
  }

  // 批量处理文件
  async processBatchFiles(files, userId) {
    const batchId = `batch_${userId}_${Date.now()}`;
    const processIds = [];

    console.log(`📦 Starting batch file processing: ${batchId}`);

    for (const file of files) {
      const result = await this.processFileUpload(file, userId);
      processIds.push(result.processId);
    }

    return {
      batchId,
      processIds,
      totalFiles: files.length,
      status: 'processing'
    };
  }

  // 获取批处理状态
  getBatchStatus(processIds) {
    const statuses = processIds.map(id => this.getProcessingStatus(id));
    
    const completed = statuses.filter(s => s.status === 'completed').length;
    const failed = statuses.filter(s => s.status === 'failed').length;
    const processing = statuses.filter(s => s.status === 'processing').length;

    return {
      total: statuses.length,
      completed,
      failed,
      processing,
      progress: (completed + failed) / statuses.length,
      statuses
    };
  }
}

// 单例模式
const asyncFileProcessor = new AsyncFileProcessor();

// 定期清理任务
setInterval(() => {
  asyncFileProcessor.cleanupCompletedTasks();
}, 60 * 60 * 1000); // 每小时清理一次

module.exports = asyncFileProcessor; 