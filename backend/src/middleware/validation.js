const { body, param, query, validationResult } = require('express-validator');

// 处理验证错误的中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array()
    });
  }
  next();
};

// 用户注册验证
const validateUserRegistration = [
  body('username')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色必须是admin或user'),
  handleValidationErrors
];

// 用户登录验证
const validateUserLogin = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空')
    .isLength({ min: 1, max: 50 })
    .withMessage('用户名长度必须在1-50个字符之间'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
    .isLength({ min: 6 })
    .withMessage('密码长度不能少于6个字符'),
  handleValidationErrors
];

// 用户更新验证
const validateUserUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色必须是admin或user'),
  handleValidationErrors
];

// 密码更新验证
const validatePasswordUpdate = [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('新密码必须包含至少一个小写字母、一个大写字母和一个数字'),
  handleValidationErrors
];

// 模型创建验证
const validateModelCreate = [
  body('name')
    .isLength({ min: 1, max: 255 })
    .withMessage('模型名称长度必须在1-255个字符之间'),
  body('architecture')
    .isLength({ min: 1, max: 100 })
    .withMessage('架构名称长度必须在1-100个字符之间'),
  body('code_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('代码路径长度不能超过500个字符'),
  body('checkpoint_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('检查点路径长度不能超过500个字符'),
  body('log_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('日志路径长度不能超过500个字符'),
  body('url')
    .optional()
    .isURL()
    .withMessage('请输入有效的URL'),
  body('info')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('信息长度不能超过1000个字符'),
  handleValidationErrors
];

// 模型更新验证
const validateModelUpdate = [
  body('name')
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage('模型名称长度必须在1-255个字符之间'),
  body('architecture')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('架构名称长度必须在1-100个字符之间'),
  body('code_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('代码路径长度不能超过500个字符'),
  body('checkpoint_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('检查点路径长度不能超过500个字符'),
  body('log_path')
    .optional()
    .isLength({ max: 500 })
    .withMessage('日志路径长度不能超过500个字符'),
  body('url')
    .optional()
    .isURL()
    .withMessage('请输入有效的URL'),
  body('info')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('信息长度不能超过1000个字符'),
  handleValidationErrors
];

// 用户创建验证
const validateUserCreate = [
  body('user_name')
    .isLength({ min: 3, max: 50 })
    .withMessage('用户名长度必须在3-50个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('用户名只能包含字母、数字和下划线'),
  body('email')
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('pwd')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('角色必须是admin或user'),
  handleValidationErrors
];

// ID参数验证
const validateIdParam = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID必须是正整数'),
  handleValidationErrors
];

// 分页参数验证
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  handleValidationErrors
];

// 搜索参数验证
const validateSearch = [
  query('q')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('搜索关键词长度必须在1-100个字符之间'),
  handleValidationErrors
];

// 酶指标验证
const validateEnzymeMetric = [
  body('model_id')
    .isInt({ min: 1 })
    .withMessage('模型ID必须是正整数'),
  body('enzyme')
    .isLength({ min: 1, max: 100 })
    .withMessage('酶名称长度必须在1-100个字符之间'),
  body('aa_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('氨基酸精确度必须在0-1之间'),
  body('aa_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('氨基酸召回率必须在0-1之间'),
  body('pep_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('肽精确度必须在0-1之间'),
  body('pep_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('肽召回率必须在0-1之间'),
  body('ptm_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('PTM精确度必须在0-1之间'),
  body('ptm_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('PTM召回率必须在0-1之间'),
  body('auc')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('AUC必须在0-1之间'),
  handleValidationErrors
];

// 物种指标验证
const validateSpeciesMetric = [
  body('model_id')
    .isInt({ min: 1 })
    .withMessage('模型ID必须是正整数'),
  body('species')
    .isLength({ min: 1, max: 100 })
    .withMessage('物种名称长度必须在1-100个字符之间'),
  body('aa_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('氨基酸精确度必须在0-1之间'),
  body('aa_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('氨基酸召回率必须在0-1之间'),
  body('pep_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('肽精确度必须在0-1之间'),
  body('pep_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('肽召回率必须在0-1之间'),
  body('ptm_precision')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('PTM精确度必须在0-1之间'),
  body('ptm_recall')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('PTM召回率必须在0-1之间'),
  body('auc')
    .optional()
    .isFloat({ min: 0, max: 1 })
    .withMessage('AUC必须在0-1之间'),
  handleValidationErrors
];

// 验证用户创建提交记录时的数据
const validateSubmissionCreation = [
  body('code_url')
    .optional()
    .isURL()
    .withMessage('代码仓库URL格式不正确')
    .isLength({ max: 500 })
    .withMessage('代码仓库URL长度不能超过500个字符'),

  body('model_info')
    .optional()
    .isJSON()
    .withMessage('模型信息必须是有效的JSON格式')
    .custom((value) => {
      if (value) {
        try {
          const modelInfo = JSON.parse(value);
          
          // 验证必要字段
          if (modelInfo.name && typeof modelInfo.name !== 'string') {
            throw new Error('模型名称必须是字符串');
          }
          if (modelInfo.name && modelInfo.name.length > 100) {
            throw new Error('模型名称长度不能超过100个字符');
          }
          
          if (modelInfo.architecture && typeof modelInfo.architecture !== 'string') {
            throw new Error('模型架构必须是字符串');
          }
          if (modelInfo.architecture && modelInfo.architecture.length > 50) {
            throw new Error('模型架构长度不能超过50个字符');
          }
          
          if (modelInfo.info && typeof modelInfo.info !== 'string') {
            throw new Error('模型信息必须是字符串');
          }
          if (modelInfo.info && modelInfo.info.length > 1000) {
            throw new Error('模型信息长度不能超过1000个字符');
          }
          
          if (modelInfo.version && typeof modelInfo.version !== 'string') {
            throw new Error('模型版本必须是字符串');
          }
          
          if (modelInfo.paper_url && !isValidUrl(modelInfo.paper_url)) {
            throw new Error('论文URL格式不正确');
          }
          
          if (modelInfo.tags && !Array.isArray(modelInfo.tags)) {
            throw new Error('标签必须是数组格式');
          }
          
          return true;
        } catch (error) {
          throw new Error(`模型信息验证失败: ${error.message}`);
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }
    next();
  }
];

// 验证用户更新提交记录时的数据
const validateSubmissionUpdate = [
  body('code_url')
    .optional()
    .isURL()
    .withMessage('代码仓库URL格式不正确')
    .isLength({ max: 500 })
    .withMessage('代码仓库URL长度不能超过500个字符'),

  body('model_info')
    .optional()
    .isJSON()
    .withMessage('模型信息必须是有效的JSON格式')
    .custom((value) => {
      if (value) {
        try {
          const modelInfo = JSON.parse(value);
          
          // 验证必要字段
          if (modelInfo.name && typeof modelInfo.name !== 'string') {
            throw new Error('模型名称必须是字符串');
          }
          if (modelInfo.name && modelInfo.name.length > 100) {
            throw new Error('模型名称长度不能超过100个字符');
          }
          
          if (modelInfo.architecture && typeof modelInfo.architecture !== 'string') {
            throw new Error('模型架构必须是字符串');
          }
          if (modelInfo.architecture && modelInfo.architecture.length > 50) {
            throw new Error('模型架构长度不能超过50个字符');
          }
          
          if (modelInfo.info && typeof modelInfo.info !== 'string') {
            throw new Error('模型信息必须是字符串');
          }
          if (modelInfo.info && modelInfo.info.length > 1000) {
            throw new Error('模型信息长度不能超过1000个字符');
          }
          
          if (modelInfo.version && typeof modelInfo.version !== 'string') {
            throw new Error('模型版本必须是字符串');
          }
          
          if (modelInfo.paper_url && !isValidUrl(modelInfo.paper_url)) {
            throw new Error('论文URL格式不正确');
          }
          
          if (modelInfo.tags && !Array.isArray(modelInfo.tags)) {
            throw new Error('标签必须是数组格式');
          }
          
          return true;
        } catch (error) {
          throw new Error(`模型信息验证失败: ${error.message}`);
        }
      }
      return true;
    }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '验证失败',
        errors: errors.array()
      });
    }
    next();
  }
];

// URL验证辅助函数
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordUpdate,
  validateModelCreate,
  validateModelUpdate,
  validateUserCreate,
  validateIdParam,
  validatePagination,
  validateSearch,
  validateEnzymeMetric,
  validateSpeciesMetric,
  validateSubmissionCreation,
  validateSubmissionUpdate
}; 