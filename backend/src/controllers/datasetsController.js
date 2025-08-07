const fs = require('fs');
const path = require('path');

// MGF数据集控制器
class DatasetsController {
  
  // 获取所有MGF文件列表
  static async getAllMGFFiles(req, res) {
    try {
      const mgfBasePath = process.env.NODE_ENV === 'production' ? '/app/data/mgf' : '/root/abnovobench/data/mgf';
      
      // 检查目录是否存在
      if (!fs.existsSync(mgfBasePath)) {
        return res.status(404).json({
          success: false,
          message: 'MGF data directory not found'
        });
      }

      const datasets = [];
      
      // 读取Protease目录
      const proteasePath = path.join(mgfBasePath, 'Protease');
      if (fs.existsSync(proteasePath)) {
        const proteaseFiles = fs.readdirSync(proteasePath)
          .filter(file => file.endsWith('.mgf'))
          .map(file => {
            const filePath = path.join(proteasePath, file);
            const stats = fs.statSync(filePath);
            const fileName = path.basename(file, '.mgf');
            
            return {
              id: `protease-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: fileName,
              category: 'protease',
              description: `Mass spectra data for ${fileName} protease digestion`,
              file_path: filePath,
              size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
              modified_date: stats.mtime.toISOString(),
              type: 'Protease-specific',
              enzyme: fileName
            };
          });
        datasets.push(...proteaseFiles);
      }

      // 读取Species目录
      const speciesPath = path.join(mgfBasePath, 'Species');
      if (fs.existsSync(speciesPath)) {
        const speciesFiles = fs.readdirSync(speciesPath)
          .filter(file => file.endsWith('.mgf'))
          .map(file => {
            const filePath = path.join(speciesPath, file);
            const stats = fs.statSync(filePath);
            const fileName = path.basename(file, '.mgf');
            
            return {
              id: `species-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: fileName,
              category: 'species',
              description: `Mass spectra data for ${fileName} species`,
              file_path: filePath,
              size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
              modified_date: stats.mtime.toISOString(),
              type: 'Species-specific',
              species: fileName
            };
          });
        datasets.push(...speciesFiles);
      }

      res.json({
        success: true,
        data: {
          datasets,
          total: datasets.length,
          categories: {
            protease: datasets.filter(d => d.category === 'protease').length,
            species: datasets.filter(d => d.category === 'species').length
          }
        }
      });

    } catch (error) {
      console.error('获取MGF文件列表错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 获取MGF文件内容预览
  static async getMGFFilePreview(req, res) {
    try {
      const { fileId } = req.params;
      
      const mgfBasePath = process.env.NODE_ENV === 'production' ? '/app/data/mgf' : '/root/abnovobench/data/mgf';
      let filePath = null;

      // 根据fileId查找实际文件
      if (fileId.startsWith('protease-')) {
        const proteasePath = path.join(mgfBasePath, 'Protease');
        if (fs.existsSync(proteasePath)) {
          const files = fs.readdirSync(proteasePath).filter(file => file.endsWith('.mgf'));
          for (const file of files) {
            const fileName = path.basename(file, '.mgf');
            const expectedId = `protease-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (expectedId === fileId) {
              filePath = path.join(proteasePath, file);
              break;
            }
          }
        }
      } else if (fileId.startsWith('species-')) {
        const speciesPath = path.join(mgfBasePath, 'Species');
        if (fs.existsSync(speciesPath)) {
          const files = fs.readdirSync(speciesPath).filter(file => file.endsWith('.mgf'));
          for (const file of files) {
            const fileName = path.basename(file, '.mgf');
            const expectedId = `species-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (expectedId === fileId) {
              filePath = path.join(speciesPath, file);
              break;
            }
          }
        }
      }

      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'MGF file not found',
          debug: {
            fileId,
            searchedPath: filePath,
            exists: filePath ? fs.existsSync(filePath) : false
          }
        });
      }

      // 读取完整文件内容
      const content = fs.readFileSync(filePath, 'utf8');
      const allLines = content.split('\n');
      
      // 解析前5个谱图作为预览
      const spectra = [];
      let currentSpectrum = null;
      let inSpectrum = false;
      
      for (let i = 0; i < allLines.length && spectra.length < 5; i++) {
        const line = allLines[i].trim();
        if (line === 'BEGIN IONS') {
          inSpectrum = true;
          currentSpectrum = { peaks: [] };
        } else if (line === 'END IONS' && currentSpectrum) {
          spectra.push(currentSpectrum);
          currentSpectrum = null;
          inSpectrum = false;
        } else if (inSpectrum && currentSpectrum) {
          if (line.startsWith('TITLE=')) {
            currentSpectrum.title = line.substring(6);
          } else if (line.startsWith('PEPMASS=')) {
            currentSpectrum.pepmass = line.substring(8);
          } else if (line.startsWith('CHARGE=')) {
            currentSpectrum.charge = line.substring(7);
          } else if (line.startsWith('SEQ=')) {
            currentSpectrum.sequence = line.substring(4);
          } else if (line.includes(' ') && !line.startsWith('SCANS=') && !line.startsWith('RTINSECONDS=')) {
            // 这是峰值数据 (m/z intensity)
            const parts = line.split(/\s+/);
            if (parts.length >= 2) {
              const mz = parseFloat(parts[0]);
              const intensity = parseFloat(parts[1]);
              if (!isNaN(mz) && !isNaN(intensity)) {
                currentSpectrum.peaks.push({ mz, intensity });
              }
            }
          }
        }
      }

      res.json({
        success: true,
        data: {
          spectra_preview: spectra,
          raw_content: content
        }
      });

    } catch (error) {
      console.error('获取MGF文件预览错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }

  // 下载MGF文件
  static async downloadMGFFile(req, res) {
    try {
      const { fileId } = req.params;
      const mgfBasePath = process.env.NODE_ENV === 'production' ? '/app/data/mgf' : '/root/abnovobench/data/mgf';
      let filePath = null;

      // 根据fileId查找实际文件
      if (fileId.startsWith('protease-')) {
        const proteasePath = path.join(mgfBasePath, 'Protease');
        if (fs.existsSync(proteasePath)) {
          const files = fs.readdirSync(proteasePath).filter(file => file.endsWith('.mgf'));
          for (const file of files) {
            const fileName = path.basename(file, '.mgf');
            const expectedId = `protease-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (expectedId === fileId) {
              filePath = path.join(proteasePath, file);
              break;
            }
          }
        }
      } else if (fileId.startsWith('species-')) {
        const speciesPath = path.join(mgfBasePath, 'Species');
        if (fs.existsSync(speciesPath)) {
          const files = fs.readdirSync(speciesPath).filter(file => file.endsWith('.mgf'));
          for (const file of files) {
            const fileName = path.basename(file, '.mgf');
            const expectedId = `species-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
            if (expectedId === fileId) {
              filePath = path.join(speciesPath, file);
              break;
            }
          }
        }
      }

      if (!filePath || !fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'MGF file not found'
        });
      }

      // 设置下载响应头
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      
      // 创建文件流并发送
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

    } catch (error) {
      console.error('下载MGF文件错误:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
}

module.exports = DatasetsController; 