const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function testSubmissionAPI() {
  try {
    console.log('🔄 开始测试 Submissions API...');
    
    // 1. 首先测试登录获取token
    console.log('\n1. 测试用户登录...');
    
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'apitest',  // 使用新创建的测试用户
      password: 'test123'   // 已知密码
    }).catch(error => {
      console.error('登录请求失败:', error.response?.data || error.message);
      throw error;
    });
    
    if (!loginResponse.data.success) {
      throw new Error('登录失败: ' + loginResponse.data.message);
    }
    
    console.log('🔍 登录响应详情:', loginResponse.data);
    const token = loginResponse.data.token || loginResponse.data.data?.token;
    console.log('✅ 登录成功，获取到token:', token ? '存在' : '缺失');
    
    // 2. 测试创建提交记录
    console.log('\n2. 测试创建提交记录...');
    
    const formData = new FormData();
    
    // 添加基本数据
    formData.append('code_url', 'https://github.com/test/repo');
    formData.append('model_info', JSON.stringify({
      name: 'Test Model',
      architecture: 'CNN',
      info: 'This is a test model',
      version: '1.0',
      tags: ['test', 'cnn']
    }));
    
    // 创建测试文件
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload');
    formData.append('codeFile', fs.createReadStream(testFilePath));
    
    const submitResponse = await axios.post(`${API_BASE}/submissions`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      }
    }).catch(error => {
      console.error('提交请求详情:', {
        url: `${API_BASE}/submissions`,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...formData.getHeaders()
        }
      });
      console.error('提交请求失败:', error.response?.data || error.message);
      throw error;
    });
    
    console.log('✅ 提交成功:', submitResponse.data);
    
    // 清理测试文件
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    console.log('\n🎉 所有测试通过！');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    if (error.response?.data) {
      console.error('响应数据:', error.response.data);
    }
  }
}

// 运行测试
testSubmissionAPI(); 