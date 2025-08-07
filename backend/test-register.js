const User = require('./src/models/User');

async function testUserRegistration() {
  try {
    console.log('🧪 测试用户注册...');
    
    const userData = {
      user_name: 'testuser',
      email: 'test@example.com',
      password: 'Test123456',
      role: 'user'
    };
    
    console.log('📝 创建用户数据:', userData);
    
    const user = await User.createUser(userData);
    console.log('✅ 用户创建成功:', user);
    
  } catch (error) {
    console.error('❌ 用户创建失败:', error.message);
    console.error('详细错误:', error);
  } finally {
    process.exit(0);
  }
}

testUserRegistration(); 