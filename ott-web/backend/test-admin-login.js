require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin setup...');
    
    // Check if profiles table exists and has admin user
    console.log('\n📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin');
    
    if (profilesError) {
      console.log('❌ Error accessing profiles table:', profilesError.message);
      return;
    }
    
    if (profiles && profiles.length > 0) {
      console.log('✅ Admin user found!');
      profiles.forEach(profile => {
        console.log(`  📧 Email: ${profile.email}`);
        console.log(`  👑 Role: ${profile.role}`);
        console.log(`  🆔 ID: ${profile.id}`);
        console.log(`  📅 Created: ${profile.created_at}`);
      });
    } else {
      console.log('⚠️  No admin users found in profiles table');
      return;
    }
    
    // Test if we can access the admin user's auth record
    console.log('\n🔐 Testing auth access...');
    const adminId = profiles[0].id;
    
    // Try to get user from auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminId);
    
    if (authError) {
      console.log('❌ Error accessing auth user:', authError.message);
    } else {
      console.log('✅ Auth user accessible');
      console.log(`  📧 Email: ${authUser.user.email}`);
      console.log(`  🔑 Confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
    }
    
    // Test if we can access other tables
    console.log('\n🗄️  Testing table access...');
    
    // Test media table
    const { data: media, error: mediaError } = await supabase
      .from('media')
      .select('count')
      .limit(1);
    
    if (mediaError) {
      console.log('❌ Media table error:', mediaError.message);
    } else {
      console.log('✅ Media table accessible');
    }
    
    // Test subscriptions table
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('count')
      .limit(1);
    
    if (subsError) {
      console.log('❌ Subscriptions table error:', subsError.message);
    } else {
      console.log('✅ Subscriptions table accessible');
    }
    
    console.log('\n🎉 Admin setup verification complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend server: npm run dev');
    console.log('2. Test the admin login with your credentials');
    console.log('3. Access the admin frontend');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAdminLogin();
