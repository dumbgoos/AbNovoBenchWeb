const fs = require('fs');
const path = require('path');

// 读取coverage depth数据
const readDepthData = () => {
  try {
    const depthDir = process.env.NODE_ENV === 'production' 
      ? '/app/data/depth' 
      : path.join(__dirname, '../../../data/depth');
    const files = fs.readdirSync(depthDir).filter(file => file.endsWith('.csv'));
    
    const depthData = [];
    
    files.forEach(file => {
      const filePath = path.join(depthDir, file);
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.trim().split(/\r?\n/);
      
      // 解析文件名获取mAb和链类型信息
      const [mAbName, chainType] = file.replace('.csv', '').split('_');
      const chain = chainType.includes('HC') ? 'Heavy Chain' : 'Light Chain';
      
      // 解析CSV数据
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const positions = headers.slice(1).map(pos => parseInt(pos.trim()));
      
      // 获取区域信息
      const regionLine = lines[2].split(',').map(r => r.replace(/"/g, '').trim());
      const regions = regionLine.slice(1);
      
      // 获取每个模型的数据
      const modelData = {};
      for (let i = 3; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.replace(/"/g, '').trim());
        const modelName = row[0];
        const values = row.slice(1).map(val => parseInt(val) || 0);
        
        modelData[modelName] = values;
      }
      
      // 计算区域边界
      const regionBoundaries = [];
      let currentRegion = regions[0];
      let regionStart = 1;
      
      for (let i = 1; i < regions.length; i++) {
        if (regions[i] !== currentRegion) {
          if (currentRegion === 'CDR1' || currentRegion === 'CDR2' || currentRegion === 'CDR3') {
            regionBoundaries.push({
              region: currentRegion,
              start: regionStart,
              end: i,
              type: 'CDR'
            });
          }
          currentRegion = regions[i];
          regionStart = i + 1;
        }
      }
      
      // 添加最后一个区域
      if (currentRegion === 'CDR1' || currentRegion === 'CDR2' || currentRegion === 'CDR3') {
        regionBoundaries.push({
          region: currentRegion,
          start: regionStart,
          end: regions.length,
          type: 'CDR'
        });
      }
      
      depthData.push({
        antibody: mAbName,
        chain: chain,
        positions: positions,
        regions: regions,
        regionBoundaries: regionBoundaries,
        models: modelData,
        filename: file
      });
    });
    
    return depthData;
  } catch (error) {
    console.error('读取depth数据文件错误:', error);
    throw new Error('无法读取depth数据文件');
  }
};

// 获取所有depth数据
const getAllDepthData = async (req, res) => {
  try {
    const depthData = readDepthData();
    
    res.json({
      success: true,
      data: {
        datasets: depthData
      }
    });
  } catch (error) {
    console.error('获取depth数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取depth数据失败'
    });
  }
};

// 根据抗体名称获取depth数据
const getDepthDataByAntibody = async (req, res) => {
  try {
    const { antibody } = req.params;
    const depthData = readDepthData();
    
    const antibodyData = depthData.filter(item => 
      item.antibody.toLowerCase() === antibody.toLowerCase()
    );
    
    if (antibodyData.length === 0) {
      return res.status(404).json({
        success: false,
        message: '未找到该抗体的depth数据'
      });
    }
    
    res.json({
      success: true,
      data: {
        datasets: antibodyData
      }
    });
  } catch (error) {
    console.error('获取抗体depth数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取抗体depth数据失败'
    });
  }
};

module.exports = {
  getAllDepthData,
  getDepthDataByAntibody
}; 