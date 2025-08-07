const fs = require('fs');
const path = require('path');

// 定义不同的indicator配置
const INDICATORS = {
  'noise_and_cleavages': {
    filename: 'NoiseFactorANDMissingcleavagesVSRecall.csv',
    name: 'Noise Factor & Missing Cleavages',
    description: 'Impact of noise factor and missing cleavages on model performance',
    type: 'heatmap', // 二维热力图
    xAxis: 'noise_factor',
    yAxis: 'missing_cleavages',
    parseRow: (row) => ({
      tool: row[0],
      aa_recall: parseFloat(row[1]) || 0,
      peptide_recall: parseFloat(row[2]) || 0,
      noise_factor: parseInt(row[3]) || 0,
      missing_cleavages: parseInt(row[4]) || 0
    })
  },
  'noise_factor': {
    filename: 'NoiseFactorVSRecall.csv',
    name: 'Noise Factor Impact',
    description: 'Impact of noise factor on model performance',
    type: 'line',
    xAxis: 'noise_factor',
    parseRow: (row) => ({
      tool: row[0],
      aa_recall: parseFloat(row[1]) || 0,
      peptide_recall: parseFloat(row[2]) || 0,
      noise_factor: parseInt(row[3]) || 0
    })
  },
  'missing_cleavages': {
    filename: 'MissingCleavagesVSRecall.csv',
    name: 'Missing Cleavages Impact',
    description: 'Impact of missing cleavage sites on model performance',
    type: 'line',
    xAxis: 'missing_cleavages',
    parseRow: (row) => ({
      tool: row[0],
      aa_recall: parseFloat(row[1]) || 0,
      peptide_recall: parseFloat(row[2]) || 0,
      missing_cleavages: parseInt(row[3]) || 0
    })
  },
  'peptide_length': {
    filename: 'LengthVsRecall2.csv',
    name: 'Peptide Length Impact',
    description: 'Impact of peptide length on model performance',
    type: 'line',
    xAxis: 'peptide_length',
    parseRow: (row) => ({
      tool: row[0],
      peptide_length: parseInt(row[1]) || 0,
      aa_recall: parseFloat(row[2]) || 0,
      aa_precision: parseFloat(row[3]) || 0,
      peptide_recall: parseFloat(row[4]) || 0,
      total_peptides: parseInt(row[5]) || 0,
      correct_predictions: parseInt(row[6]) || 0,
      incorrect_predictions: parseInt(row[7]) || 0,
      peptides_no_missing_cleavages: parseInt(row[8]) || 0
    })
  },
  'missing_cleavages_with_a_ions': {
    filename: 'MissingCleavages_inlcudingAIons_VSRecall.csv',
    name: 'Missing Cleavages (with A-ions)',
    description: 'Impact of missing cleavage sites including A-ions on model performance',
    type: 'line',
    xAxis: 'missing_cleavages',
    parseRow: (row) => ({
      tool: row[0],
      aa_recall: parseFloat(row[1]) || 0,
      peptide_recall: parseFloat(row[2]) || 0,
      missing_cleavages: parseInt(row[3]) || 0
    })
  }
};

// 读取特定indicator的数据
const readIndicatorData = (indicatorKey) => {
  try {
    const indicator = INDICATORS[indicatorKey];
    if (!indicator) {
      throw new Error(`Unknown indicator: ${indicatorKey}`);
    }

    const impactDir = process.env.NODE_ENV === 'production'
      ? '/app/data/impact'
      : path.join(__dirname, '../../../data/impact');
    const filePath = path.join(impactDir, indicator.filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Indicator data file not found: ${indicator.filename}`);
    }
    
    const csvContent = fs.readFileSync(filePath, 'utf8');
    const lines = csvContent.trim().split(/\r?\n/);
    
    // 跳过头部
    const dataLines = lines.slice(1);
    const parsedData = [];
    
    // 解析数据行
    for (const line of dataLines) {
      const row = line.split(',').map(cell => cell.trim());
      
      if (row.length >= 3) { // 至少需要tool, recall数据
        try {
          const dataPoint = indicator.parseRow(row);
          parsedData.push(dataPoint);
        } catch (parseError) {
          console.warn(`Failed to parse row: ${line}`, parseError);
        }
      }
    }
    
    // 按工具分组数据
    const groupedData = {};
    parsedData.forEach(item => {
      if (!groupedData[item.tool]) {
        groupedData[item.tool] = [];
      }
      
      // 转换百分比为小数形式
      const processedItem = { ...item };
      if (processedItem.aa_recall) processedItem.aa_recall = processedItem.aa_recall * 0.01;
      if (processedItem.peptide_recall) processedItem.peptide_recall = processedItem.peptide_recall * 0.01;
      if (processedItem.aa_precision) processedItem.aa_precision = processedItem.aa_precision * 0.01;
      
      groupedData[item.tool].push(processedItem);
    });
    
    return {
      indicator: {
        key: indicatorKey,
        name: indicator.name,
        description: indicator.description,
        type: indicator.type,
        xAxis: indicator.xAxis,
        yAxis: indicator.yAxis
      },
      data: groupedData
    };
  } catch (error) {
    console.error(`读取indicator数据文件错误 (${indicatorKey}):`, error);
    throw new Error(`无法读取indicator数据文件: ${indicatorKey}`);
  }
};

// 读取所有indicators数据
const readAllIndicatorsData = () => {
  try {
    const allData = {};
    
    for (const [key, config] of Object.entries(INDICATORS)) {
      try {
        allData[key] = readIndicatorData(key);
      } catch (error) {
        console.warn(`Failed to load indicator ${key}:`, error.message);
        // 继续加载其他indicators，不因为一个失败就全部失败
      }
    }
    
    return allData;
  } catch (error) {
    console.error('读取所有indicators数据错误:', error);
    throw new Error('无法读取indicators数据');
  }
};

// 获取所有indicators列表
const getAllIndicators = async (req, res) => {
  try {
    const indicators = Object.keys(INDICATORS).map(key => ({
      key,
      name: INDICATORS[key].name,
      description: INDICATORS[key].description,
      type: INDICATORS[key].type
    }));
    
    res.json({
      success: true,
      data: {
        indicators
      }
    });
  } catch (error) {
    console.error('获取indicators列表错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取indicators列表失败'
    });
  }
};

// 获取所有robustness数据（向后兼容）
const getAllRobustnessData = async (req, res) => {
  try {
    const allData = readAllIndicatorsData();
    
    res.json({
      success: true,
      data: {
        indicators: allData
      }
    });
  } catch (error) {
    console.error('获取robustness数据错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取robustness数据失败'
    });
  }
};

// 获取特定indicator的数据
const getIndicatorData = async (req, res) => {
  try {
    const { indicatorKey } = req.params;
    
    if (!INDICATORS[indicatorKey]) {
      return res.status(404).json({
        success: false,
        message: `未找到indicator: ${indicatorKey}`
      });
    }
    
    const indicatorData = readIndicatorData(indicatorKey);
    
    res.json({
      success: true,
      data: indicatorData
    });
  } catch (error) {
    console.error('获取indicator数据错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取indicator数据失败'
    });
  }
};

// 获取特定工具的robustness数据（向后兼容）
const getRobustnessByTool = async (req, res) => {
  try {
    const { toolName } = req.params;
    
    // 默认使用原来的noise_and_cleavages indicator来保持向后兼容
    const indicatorData = readIndicatorData('noise_and_cleavages');
    
    if (!indicatorData.data[toolName]) {
      return res.status(404).json({
        success: false,
        message: `未找到工具 ${toolName} 的robustness数据`
      });
    }
    
    res.json({
      success: true,
      data: {
        tool: toolName,
        data: indicatorData.data[toolName]
      }
    });
  } catch (error) {
    console.error('获取特定工具robustness数据错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取robustness数据失败'
    });
  }
};

// 获取特定indicator和工具的数据
const getIndicatorByTool = async (req, res) => {
  try {
    const { indicatorKey, toolName } = req.params;
    
    if (!INDICATORS[indicatorKey]) {
      return res.status(404).json({
        success: false,
        message: `未找到indicator: ${indicatorKey}`
      });
    }
    
    const indicatorData = readIndicatorData(indicatorKey);
    
    if (!indicatorData.data[toolName]) {
      return res.status(404).json({
        success: false,
        message: `未找到工具 ${toolName} 在indicator ${indicatorKey} 中的数据`
      });
    }
    
    res.json({
      success: true,
      data: {
        indicator: indicatorData.indicator,
        tool: toolName,
        data: indicatorData.data[toolName]
      }
    });
  } catch (error) {
    console.error('获取特定indicator和工具数据错误:', error);
    res.status(500).json({
      success: false,
      message: error.message || '获取数据失败'
    });
  }
};

module.exports = {
  getAllIndicators,
  getAllRobustnessData,
  getIndicatorData,
  getRobustnessByTool,
  getIndicatorByTool
}; 