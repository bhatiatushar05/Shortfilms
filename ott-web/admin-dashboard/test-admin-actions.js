const axios = require('axios');

const API_BASE = 'http://localhost:5001/api';

async function testAdminActions() {
  console.log('🧪 Testing Admin Dashboard Actions...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@shortcinema.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');

    // Set auth header
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Step 2: Get users
    console.log('2️⃣ Fetching users...');
    const usersResponse = await axios.get(`${API_BASE}/users`);
    const users = usersResponse.data.data.users;
    console.log(`✅ Found ${users.length} users`);
    
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'tbhatia442@gmail.com') || users[0];
      console.log(`📝 Test user: ${testUser.email} (${testUser.status})`);
    }

    // Step 3: Test status update
    console.log('\n3️⃣ Testing user status update...');
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'tbhatia442@gmail.com') || users[0];
      const newStatus = testUser.status === 'active' ? 'suspended' : 'active';
      
      const statusResponse = await axios.patch(`${API_BASE}/users/${testUser.id}/status`, {
        status: newStatus
      });
      
      console.log(`✅ Status updated to: ${newStatus}`);
      
      // Revert back
      await axios.patch(`${API_BASE}/users/${testUser.id}/status`, {
        status: testUser.status
      });
      console.log(`🔄 Status reverted back to: ${testUser.status}`);
    }

    // Step 4: Test role update
    console.log('\n4️⃣ Testing user role update...');
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'tbhatia442@gmail.com') || users[0];
      const currentRole = testUser.role;
      const newRole = currentRole === 'user' ? 'moderator' : 'user';
      
      const roleResponse = await axios.patch(`${API_BASE}/users/${testUser.id}/role`, {
        role: newRole
      });
      
      console.log(`✅ Role updated to: ${newRole}`);
      
      // Revert back
      await axios.patch(`${API_BASE}/users/${testUser.id}/role`, {
        role: currentRole
      });
      console.log(`🔄 Role reverted back to: ${currentRole}`);
    }

    // Step 5: Test user analytics
    console.log('\n5️⃣ Testing user analytics...');
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'tbhatia442@gmail.com') || users[0];
      
      const analyticsResponse = await axios.get(`${API_BASE}/users/${testUser.id}/analytics`);
      const analytics = analyticsResponse.data.data;
      
      console.log(`✅ Analytics retrieved for ${analytics.email}`);
      console.log(`   - Watch time: ${analytics.totalWatchTime} minutes`);
      console.log(`   - Watchlist: ${analytics.watchlistCount} items`);
      console.log(`   - Progress: ${analytics.progressCount} items`);
    }

    // Step 6: Test user preferences
    console.log('\n6️⃣ Testing user preferences...');
    if (users.length > 0) {
      const testUser = users.find(u => u.email === 'tbhatia442@gmail.com') || users[0];
      
      const preferencesResponse = await axios.get(`${API_BASE}/users/${testUser.id}/preferences`);
      const preferences = preferencesResponse.data.data;
      
      console.log(`✅ Preferences retrieved for ${preferences.email}`);
      console.log(`   - Subscription: ${preferences.subscription}`);
      console.log(`   - Last activity: ${preferences.lastActivity}`);
    }

    console.log('\n🎉 All admin actions are working perfectly!');
    console.log('✅ Status updates: WORKING');
    console.log('✅ Role updates: WORKING');
    console.log('✅ User analytics: WORKING');
    console.log('✅ User preferences: WORKING');
    console.log('✅ User management: FULLY FUNCTIONAL');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    console.error('Full error:', error.response?.data || error);
  }
}

// Run the test
testAdminActions();
