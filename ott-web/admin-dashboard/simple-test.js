const axios = require('axios');

async function simpleTest() {
  console.log('🧪 Simple Admin Actions Test...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'admin@shortcinema.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful!');
    console.log(`Token: ${token.substring(0, 50)}...`);

    // Step 2: Test users API
    console.log('\n2️⃣ Testing users API...');
    const usersResponse = await axios.get('http://localhost:5001/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`✅ Found ${usersResponse.data.data.users.length} users`);
    
    if (usersResponse.data.data.users.length > 0) {
      const testUser = usersResponse.data.data.users.find(u => u.email === 'tbhatia442@gmail.com');
      if (testUser) {
        console.log(`📝 Test user: ${testUser.email} (${testUser.status})`);
        
        // Step 3: Test status update
        console.log('\n3️⃣ Testing status update...');
        const newStatus = testUser.status === 'active' ? 'suspended' : 'active';
        
        const statusResponse = await axios.patch(
          `http://localhost:5001/api/users/${testUser.id}/status`,
          { status: newStatus },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        console.log(`✅ Status updated to: ${newStatus}`);
        console.log(`Response: ${JSON.stringify(statusResponse.data)}`);
        
        // Step 4: Test role update
        console.log('\n4️⃣ Testing role update...');
        const currentRole = testUser.role;
        const newRole = currentRole === 'user' ? 'moderator' : 'user';
        
        const roleResponse = await axios.patch(
          `http://localhost:5001/api/users/${testUser.id}/role`,
          { role: newRole },
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        console.log(`✅ Role updated to: ${newRole}`);
        console.log(`Response: ${JSON.stringify(roleResponse.data)}`);
        
        console.log('\n🎉 All admin actions are working!');
      } else {
        console.log('❌ Test user not found');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('Response data:', error.response.data);
    }
  }
}

simpleTest();
