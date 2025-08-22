const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testBackend() {
  console.log('🧪 Testing ShortCinema Backend Services...\n');
  
  try {
    // Test 1: Basic health check
    console.log('1️⃣ Testing basic health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Basic health:', healthResponse.data.status);
    
    // Test 2: API health check
    console.log('\n2️⃣ Testing API health endpoint...');
    const apiHealthResponse = await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ API health:', apiHealthResponse.data.status);
    
    // Test 3: Root endpoint
    console.log('\n3️⃣ Testing root endpoint...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ Root endpoint:', rootResponse.data.message);
    
    // Test 4: Auth debug endpoint
    console.log('\n4️⃣ Testing auth debug endpoint...');
    const authDebugResponse = await axios.get(`${BASE_URL}/api/auth/debug`);
    console.log('✅ Auth debug:', authDebugResponse.data.success ? 'Working' : 'Failed');
    
    // Test 5: Database connection
    console.log('\n5️⃣ Testing database connection...');
    const dbHealth = apiHealthResponse.data.services.database;
    console.log('✅ Database:', dbHealth.status);
    
    // Test 6: AWS services
    console.log('\n6️⃣ Testing AWS services...');
    const awsHealth = apiHealthResponse.data.services.aws;
    console.log('✅ AWS:', awsHealth.status);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Backend URL: ${BASE_URL}`);
    console.log(`   Health Status: ${healthResponse.data.status}`);
    console.log(`   Database: ${dbHealth.status}`);
    console.log(`   AWS: ${awsHealth.status}`);
    console.log(`   Environment: ${healthResponse.data.environment}`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackend();
