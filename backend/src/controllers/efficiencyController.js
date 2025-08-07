const fs = require('fs');
const path = require('path');

// 读取efficiency CSV文件
const readEfficiencyData = () => {
  try {
    const filePath = process.env.NODE_ENV === 'production'
      ? '/app/data/csv/efficiency.csv'
      : path.join(__dirname, '../../../data/csv/efficiency.csv');
    const csvContent = fs.readFileSync(filePath, 'utf8');
    
    // 按行分割CSV内容，处理不同的换行符
    const lines = csvContent.trim().split(/\r?\n/);
    
    // 跳过标题行，处理数据
    const efficiencyData = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        // 分割CSV行（简单的逗号分割，假设数据中没有逗号）
        const columns = line.split(',');
        if (columns.length >= 2) {
          const algorithm = columns[0].trim();
          const speed = parseFloat(columns[1].trim());
          
          if (algorithm && !isNaN(speed)) {
            efficiencyData.push({
              model_name: algorithm,
              speed_spectrums_per_second: speed,
              architecture: getArchitecture(algorithm), // 根据算法名称推断架构
              model_id: i // 使用行号作为临时ID
            });
          }
        }
      }
    }
    
    return efficiencyData;
  } catch (error) {
    console.error('读取efficiency CSV文件错误:', error);
    throw new Error('无法读取efficiency数据文件');
  }
};

// 根据算法名称推断架构类型
const getArchitecture = (algorithm) => {
  const algorithmLower = algorithm.toLowerCase();
  
  if (algorithmLower.includes('transformer') || algorithmLower.includes('casanov') || 
      algorithmLower.includes('contra') || algorithmLower.includes('insta') ||
      algorithmLower.includes('pi-') || algorithmLower.includes('adanovo')) {
    return 'Transformer';
  } else if (algorithmLower.includes('point') || algorithmLower.includes('pgpoint')) {
    return 'PointNet';
  } else if (algorithmLower.includes('pepnet') || algorithmLower.includes('smsnet')) {
    return 'CNN';
  } else if (algorithmLower.includes('deepnovo')) {
    return 'RNN';
  } else {
    return 'Unknown';
  }
};

// 获取所有efficiency数据
const getAllEfficiency = async (req, res) => {
  try {
    const efficiencyData = readEfficiencyData();
    
    res.json({
      success: true,
      data: {
        efficiency: efficiencyData
      }
    });
  } catch (error) {
    console.error('获取efficiency数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取efficiency数据失败'
    });
  }
};

// 根据模型名称获取efficiency数据
const getEfficiencyByModel = async (req, res) => {
  try {
    const { modelName } = req.params;
    const efficiencyData = readEfficiencyData();
    
    const modelData = efficiencyData.find(item => 
      item.model_name.toLowerCase() === modelName.toLowerCase()
    );
    
    if (!modelData) {
      return res.status(404).json({
        success: false,
        message: '未找到该模型的efficiency数据'
      });
    }
    
    res.json({
      success: true,
      data: {
        efficiency: modelData
      }
    });
  } catch (error) {
    console.error('获取模型efficiency数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取模型efficiency数据失败'
    });
  }
};

module.exports = {
  getAllEfficiency,
  getEfficiencyByModel
}; 