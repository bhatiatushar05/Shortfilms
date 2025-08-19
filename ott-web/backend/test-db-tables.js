const { supabase } = require('./config/database');

async function testDatabaseTables() {
  console.log('🧪 Testing Database Tables...\n');

  try {
    // Test 1: Check if user_controls table exists
    console.log('1️⃣ Testing user_controls table...');
    try {
      const { data, error } = await supabase
        .from('user_controls')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ user_controls table error:', error.message);
      } else {
        console.log('✅ user_controls table exists and accessible');
        console.log('   Records found:', data?.length || 0);
      }
    } catch (err) {
      console.log('❌ user_controls table exception:', err.message);
    }

    // Test 2: Check if user_subscriptions table exists
    console.log('\n2️⃣ Testing user_subscriptions table...');
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ user_subscriptions table error:', error.message);
      } else {
        console.log('✅ user_subscriptions table exists and accessible');
        console.log('   Records found:', data?.length || 0);
      }
    } catch (err) {
      console.log('❌ user_subscriptions table exception:', err.message);
    }

    // Test 3: Check profiles table structure
    console.log('\n3️⃣ Testing profiles table...');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ profiles table error:', error.message);
      } else {
        console.log('✅ profiles table exists and accessible');
        console.log('   Records found:', data?.length || 0);
        
        // Check if subscription column exists
        if (data && data.length > 0) {
          const firstRecord = data[0];
          console.log('   Available columns:', Object.keys(firstRecord));
          
          if ('subscription' in firstRecord) {
            console.log('✅ subscription column exists');
          } else {
            console.log('❌ subscription column missing');
          }
        }
      }
    } catch (err) {
      console.log('❌ profiles table exception:', err.message);
    }

    // Test 4: Check auth.users table access
    console.log('\n4️⃣ Testing auth.users access...');
    try {
      const { data, error } = await supabase
        .from('ott_users_admin_view')
        .select('*')
        .limit(1);
      
      if (error) {
        console.log('❌ ott_users_admin_view error:', error.message);
      } else {
        console.log('✅ ott_users_admin_view exists and accessible');
        console.log('   Records found:', data?.length || 0);
      }
    } catch (err) {
      console.log('❌ ott_users_admin_view exception:', err.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabaseTables();
