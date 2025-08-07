# ABNovoBench 后端API

ABNovoBench 生物信息学模型评估平台的后端API服务。

## 功能特性

- 🔐 用户认证和授权（JWT）
- 👥 用户管理系统
- 🤖 模型管理
- 📊 评估指标管理（酶指标、物种指标）
- 📝 用户提交记录管理
- 🔒 安全中间件（Helmet、CORS、限流）
- ✅ 数据验证
- 📖 完整的API文档

## 技术栈

- **Node.js** - 运行时环境
- **Express.js** - Web框架
- **PostgreSQL** - 数据库
- **JWT** - 身份验证
- **bcryptjs** - 密码加密
- **express-validator** - 数据验证
- **helmet** - 安全中间件
- **cors** - 跨域资源共享
- **morgan** - 请求日志

## 安装和运行

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 环境配置

复制环境变量文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接等信息：

```env
# 服务器配置
PORT=5000
NODE_ENV=development

# 数据库配置
DB_HOST=your-database-host
DB_PORT=5432
DB_NAME=abnovobench
DB_USER=your-database-user
DB_PASSWORD=your-secure-password

# JWT配置
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS配置
CORS_ORIGIN=http://localhost:3000
```

### 3. 启动服务

开发模式：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

测试：
```bash
npm test
```

## API 端点

### 认证相关 (`/api/auth`)

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/verify` - 验证令牌
- `GET /api/auth/me` - 获取当前用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 更新密码

### 模型管理 (`/api/models`)

- `GET /api/models` - 获取所有模型
- `GET /api/models/:id` - 获取模型详情
- `POST /api/models` - 创建模型（管理员）
- `PUT /api/models/:id` - 更新模型（管理员）
- `DELETE /api/models/:id` - 删除模型（管理员）
- `GET /api/models/stats/overview` - 获取模型统计
- `GET /api/models/search/architecture` - 根据架构搜索模型

### 用户管理 (`/api/users`)

- `GET /api/users` - 获取所有用户（管理员）
- `GET /api/users/:id` - 获取用户详情（管理员）
- `POST /api/users` - 创建用户（管理员）
- `PUT /api/users/:id` - 更新用户（管理员）
- `DELETE /api/users/:id` - 删除用户（管理员）
- `POST /api/users/:id/reset-password` - 重置用户密码（管理员）
- `GET /api/users/stats/overview` - 获取用户统计（管理员）
- `GET /api/users/search/query` - 搜索用户（管理员）
- `GET /api/users/:id/activity` - 获取用户活动记录（管理员）

### 评估指标 (`/api/metrics`)

#### 酶指标
- `GET /api/metrics/enzyme` - 获取所有酶指标
- `GET /api/metrics/enzyme/model/:modelId` - 获取模型的酶指标
- `POST /api/metrics/enzyme` - 创建酶指标（管理员）
- `PUT /api/metrics/enzyme/:id` - 更新酶指标（管理员）
- `DELETE /api/metrics/enzyme/:id` - 删除酶指标（管理员）
- `GET /api/metrics/enzyme/leaderboard` - 获取酶指标排行榜
- `GET /api/metrics/enzyme/types` - 获取所有酶类型
- `GET /api/metrics/enzyme/stats` - 获取酶指标统计

#### 物种指标
- `GET /api/metrics/species` - 获取所有物种指标
- `GET /api/metrics/species/model/:modelId` - 获取模型的物种指标
- `POST /api/metrics/species` - 创建物种指标（管理员）
- `PUT /api/metrics/species/:id` - 更新物种指标（管理员）
- `DELETE /api/metrics/species/:id` - 删除物种指标（管理员）
- `GET /api/metrics/species/leaderboard` - 获取物种指标排行榜
- `GET /api/metrics/species/types` - 获取所有物种类型
- `GET /api/metrics/species/stats` - 获取物种指标统计

#### 比较
- `GET /api/metrics/comparison/:modelId` - 获取模型的物种和酶指标比较

### 提交记录 (`/api/submissions`)

- `GET /api/submissions` - 获取所有提交记录（管理员）
- `GET /api/submissions/:id` - 获取提交详情
- `POST /api/submissions` - 创建提交记录
- `PUT /api/submissions/:id` - 更新提交记录
- `DELETE /api/submissions/:id` - 删除提交记录
- `GET /api/submissions/my/submissions` - 获取当前用户的提交记录
- `GET /api/submissions/architecture/:architecture` - 根据架构获取提交记录
- `GET /api/submissions/stats/overview` - 获取提交统计
- `GET /api/submissions/recent/list` - 获取最近的提交记录
- `GET /api/submissions/architectures/all` - 获取所有架构类型
- `GET /api/submissions/search/query` - 搜索提交记录
- `DELETE /api/submissions/batch/delete` - 批量删除提交记录（管理员）

### 系统相关

- `GET /api/health` - 健康检查

## 数据库结构

### 用户表 (users)
- `id` - 主键
- `username` - 用户名
- `email` - 邮箱
- `password` - 密码（加密）
- `role` - 角色（user/admin）
- `created_at` - 创建时间
- `is_delete` - 是否删除

### 模型表 (model)
- `id` - 主键
- `code_path` - 代码路径
- `checkpoint_path` - 检查点路径
- `name` - 模型名称
- `architecture` - 架构
- `description` - 描述
- `tags` - 标签
- `paper_url` - 论文链接
- `github_url` - GitHub链接
- `huggingface_url` - HuggingFace链接
- `is_public` - 是否公开
- `created_at` - 创建时间
- `is_delete` - 是否删除

### 酶指标表 (metric_enzyme)
- `id` - 主键
- `model_id` - 模型ID
- `enzyme` - 酶类型
- `precision` - 精确度
- `recall` - 召回率
- `f1_score` - F1分数
- `accuracy` - 准确率
- `auc` - AUC值
- `created_at` - 创建时间
- `is_delete` - 是否删除

### 物种指标表 (metric_species)
- `id` - 主键
- `model_id` - 模型ID
- `species` - 物种类型
- `precision` - 精确度
- `recall` - 召回率
- `f1_score` - F1分数
- `accuracy` - 准确率
- `auc` - AUC值
- `created_at` - 创建时间
- `is_delete` - 是否删除

### 用户提交表 (user_submit)
- `id` - 主键
- `user_id` - 用户ID
- `architecture` - 架构
- `description` - 描述
- `code_path` - 代码路径
- `checkpoint_path` - 检查点路径
- `paper_url` - 论文链接
- `github_url` - GitHub链接
- `huggingface_url` - HuggingFace链接
- `created_at` - 创建时间
- `is_delete` - 是否删除

## 认证和授权

### JWT令牌

API使用JWT（JSON Web Token）进行身份验证。在请求头中包含Bearer令牌：

```
Authorization: Bearer <your-jwt-token>
```

### 用户角色

- **user**: 普通用户，可以查看公开数据，管理自己的提交记录
- **admin**: 管理员，拥有所有权限，可以管理用户、模型、指标等

## 错误处理

API使用标准的HTTP状态码和统一的错误响应格式：

```json
{
  "success": false,
  "message": "错误描述",
  "errors": [] // 详细错误信息（可选）
}
```

常见状态码：
- `200` - 成功
- `201` - 创建成功
- `400` - 请求错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误

## 开发指南

### 项目结构

```
backend/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── utils/          # 工具函数
│   └── server.js       # 主服务器文件
├── .env.example        # 环境变量示例
├── .env                # 环境变量
├── package.json        # 依赖配置
└── README.md          # 说明文档
```

### 代码规范

- 使用ES6+语法
- 遵循RESTful API设计原则
- 统一的错误处理和响应格式
- 完整的数据验证
- 适当的注释和文档

### 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交代码
4. 创建Pull Request

## 许可证

MIT License 