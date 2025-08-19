const axios = require('axios');

// Create test users in the admin system
async function createTestUsers() {
  try {
    console.log('🔄 Creating test users...');
    
    // First, login to get a token
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@shortcinema.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful, token obtained');
    
    // Now let's manually create some test users by calling the users API
    // The backend should automatically create test users if none exist
    const usersResponse = await axios.get('http://localhost:5001/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Users API Response:');
    console.log(JSON.stringify(usersResponse.data, null, 2));
    
    if (usersResponse.data.data.users.length > 1) {
      console.log('🎉 Success! Multiple users are now available in your admin dashboard!');
      console.log(`📈 Total users: ${usersResponse.data.data.users.length}`);
    } else {
      console.log('⚠️  Still only 1 user. The test user creation might need manual database insertion.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestUsers();
