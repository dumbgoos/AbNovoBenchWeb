const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// 测试API端点
async function testAPI() {
  try {
    console.log('🧪 开始测试ABNovoBench API...\n');

    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查成功:', healthResponse.data.message);
    console.log('');

    // 2. 测试用户注册
    console.log('2. 测试用户注册...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123456',
      role: 'user'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, registerData);
      console.log('✅ 用户注册成功:', registerResponse.data.message);
      console.log('用户信息:', registerResponse.data.data.user);
      console.log('');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('⚠️  用户可能已存在:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // 3. 测试用户登录
    console.log('3. 测试用户登录...');
    const loginData = {
      username: 'testuser',
      password: 'Test123456'
    };
    
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    console.log('✅ 用户登录成功:', loginResponse.data.message);
    const token = loginResponse.data.data.token;
    console.log('获取到令牌:', token.substring(0, 20) + '...');
    console.log('');

    // 4. 测试获取当前用户信息
    console.log('4. 测试获取当前用户信息...');
    const userResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取用户信息成功:', userResponse.data.data.user);
    console.log('');

    // 5. 测试获取模型列表
    console.log('5. 测试获取模型列表...');
    const modelsResponse = await axios.get(`${API_BASE_URL}/models`);
    console.log('✅ 获取模型列表成功，共', modelsResponse.data.data.models.length, '个模型');
    console.log('');

    // 6. 测试获取提交记录
    console.log('6. 测试获取我的提交记录...');
    const submissionsResponse = await axios.get(`${API_BASE_URL}/submissions/my/submissions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 获取提交记录成功，共', submissionsResponse.data.data.submissions.length, '个提交');
    console.log('');

    console.log('🎉 所有API测试完成！');

  } catch (error) {
    console.error('❌ API测试失败:', error.response?.data?.message || error.message);
    console.error('错误详情:', error.response?.data || error.message);
  }
}

// 运行测试
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 