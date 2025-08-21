const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'admin@shortcinema.com';
const TEST_PASSWORD = 'admin123';

async function testAuthentication() {
  console.log('🧪 Testing Authentication Flow...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Login
    console.log('2️⃣ Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    console.log('✅ Login successful');
    console.log('👤 User:', loginResponse.data.data.user);
    console.log('🎫 Token length:', loginResponse.data.data.token.length);
    console.log('');

    const token = loginResponse.data.data.token;

    // Test 3: Verify Token
    console.log('3️⃣ Testing Token Verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Token verification successful');
    console.log('🔍 Verification result:', verifyResponse.data.data);
    console.log('');

    // Test 4: Debug Endpoint
    console.log('4️⃣ Testing Debug Endpoint...');
    const debugResponse = await axios.get(`${BASE_URL}/auth/debug`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Debug endpoint successful');
    console.log('🔍 Debug info:', debugResponse.data.data);
    console.log('');

    // Test 5: Protected Endpoint (Analytics)
    console.log('5️⃣ Testing Protected Endpoint (Analytics)...');
    const analyticsResponse = await axios.get(`${BASE_URL}/analytics/overview`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Analytics endpoint successful');
    console.log('📊 Data received:', analyticsResponse.data.data.overview);
    console.log('');

    console.log('🎉 All tests passed! Authentication is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - check credentials and JWT_SECRET');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🌐 Connection refused - make sure backend is running on port 5000');
    } else if (error.response?.status === 500) {
      console.error('💥 Server error - check backend logs');
    }
  }
}

// Run the test
testAuthentication();
