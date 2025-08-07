const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parse/sync');

// 获取所有assembly scores数据
router.get('/scores', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const csvPath = process.env.NODE_ENV === 'production'
      ? '/app/data/assembly/assembly_scores.csv'
      : path.join(__dirname, '../../../data/assembly/assembly_scores.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'Assembly scores CSV file not found'
      });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // 分页计算
    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          totalPages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('获取Assembly scores错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取assembly statistics数据
router.get('/stats', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const csvPath = process.env.NODE_ENV === 'production'
      ? '/app/data/assembly/assembly_static.csv'
      : path.join(__dirname, '../../../data/assembly/assembly_static.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'Assembly statistics CSV file not found'
      });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = csv.parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    // 分页计算
    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          totalPages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('获取Assembly statistics错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 获取ALPS结果数据
router.get('/alps', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const csvPath = process.env.NODE_ENV === 'production'
      ? '/app/data/assembly/Assembly-result_ALPS.csv'
      : path.join(__dirname, '../../../data/assembly/Assembly-result_ALPS.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'ALPS results CSV file not found'
      });
    }

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    // ALPS CSV文件格式特殊，需要特殊处理
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').slice(1); // 跳过第一列
    
    const records = [];
    let currentAlgorithm = '';
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      const firstCol = columns[0].trim();
      
      if (firstCol && !firstCol.match(/^(Mapped contigs|Sequence coverage|Sequence accuracy|Longest contig|Length)$/)) {
        currentAlgorithm = firstCol;
        continue;
      }
      
      if (firstCol) {
        const metric = firstCol;
        for (let j = 1; j < columns.length && j - 1 < headers.length; j++) {
          const antibody = headers[j - 1].trim();
          const value = columns[j] ? columns[j].trim() : '';
          
          if (antibody && value) {
            records.push({
              algorithm: currentAlgorithm,
              metric: metric,
              antibody: antibody,
              value: value
            });
          }
        }
      }
    }

    // 分页计算
    const totalRecords = records.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const offset = (page - 1) * limit;
    const paginatedRecords = records.slice(offset, offset + parseInt(limit));

    res.json({
      success: true,
      data: {
        records: paginatedRecords,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalRecords,
          totalPages: totalPages,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('获取ALPS results错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误'
    });
  }
});

module.exports = router;