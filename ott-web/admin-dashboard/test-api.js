// Test script to verify backend API connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';

async function testAPI() {
  console.log('Testing API connection to:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test users endpoint
    console.log('\n2. Testing users endpoint...');
    const usersResponse = await axios.get(`${API_BASE_URL}/users`);
    console.log('✅ Users endpoint working:', usersResponse.data);
    
    // Test analytics endpoint
    console.log('\n3. Testing analytics endpoint...');
    const analyticsResponse = await axios.get(`${API_BASE_URL}/analytics/overview`);
    console.log('✅ Analytics endpoint working:', analyticsResponse.data);
    
    console.log('\n🎉 All API endpoints are working correctly!');
    
  } catch (error) {
    console.error('\n❌ API test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure your backend server is running on port 5001');
      console.log('   Run: cd ott-web/backend && npm start');
    }
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data);
    }
  }
}

// Run the test
testAPI();
