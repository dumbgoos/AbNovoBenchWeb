const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  console.log('File received:', file.fieldname, file.originalname, file.mimetype);
  
  // 允许的文件类型
  const allowedMimes = [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-tar',
    'application/gzip',
    'application/x-7z-compressed',
    'application/octet-stream',
    'application/x-python-code',
    'text/x-python-script',
    'application/x-pickle',
    'application/x-pytorch',
    'application/x-tensorflow'
  ];
  
  // 允许的文件扩展名
  const allowedExtensions = ['.zip', '.tar', '.gz', '.7z', '.pkl', '.pth', '.h5', '.ckpt', '.py'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.originalname}`), false);
  }
};

// 配置multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 2 // 最多2个文件
  },
  fileFilter: fileFilter
}).fields([
  { name: 'codeFile', maxCount: 1 },
  { name: 'modelFile', maxCount: 1 }
]);

// 文件上传中间件
const uploadFiles = (req, res, next) => {
  upload(req, res, function (err) {
    if (err) {
      console.error('Upload error:', err);
      
      // 清理已上传的文件（如果有的话）
      if (req.files) {
        Object.values(req.files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      return next(err);
    }
    
    console.log('Upload successful - Body:', req.body);
    console.log('Upload successful - Files:', req.files);
    next();
  });
};

// 文件上传错误处理中间件
const handleUploadErrors = (err, req, res, next) => {
  if (err) {
    console.error('Upload error details:', err);
    
    // 根据错误类型返回相应的错误信息
    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({
            success: false,
            message: '文件太大，限制为100MB'
          });
        case 'LIMIT_FILE_COUNT':
          return res.status(400).json({
            success: false,
            message: '文件数量超出限制，最多允许2个文件'
          });
        case 'LIMIT_FIELD_COUNT':
          return res.status(400).json({
            success: false,
            message: '字段数量超出限制'
          });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({
            success: false,
            message: '不期望的文件字段'
          });
        default:
          return res.status(400).json({
            success: false,
            message: `文件上传错误: ${err.message}`
          });
      }
    }
    
    // 自定义错误（如文件类型不支持）
    return res.status(400).json({
      success: false,
      message: err.message || '文件上传失败'
    });
  }
  
  next();
};

module.exports = {
  uploadFiles,
  handleUploadErrors,
  uploadDir
}; 