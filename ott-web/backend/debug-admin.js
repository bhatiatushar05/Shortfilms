require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAdmin() {
  try {
    console.log('🔍 Debugging Admin Setup...');
    console.log('📡 Supabase URL:', process.env.SUPABASE_URL);
    console.log('🔑 Service Role Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    
    // Check if profiles table exists and has data
    console.log('\n📋 Checking profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');
    
    if (profilesError) {
      console.log('❌ Profiles table error:', profilesError.message);
      return;
    }
    
    console.log('✅ Profiles table accessible');
    console.log('📊 Total profiles:', profiles.length);
    
    if (profiles.length > 0) {
      console.log('\n👥 Profile details:');
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ID: ${profile.id}`);
        console.log(`     Email: ${profile.email}`);
        console.log(`     Role: ${profile.role}`);
        console.log(`     Status: ${profile.status}`);
        console.log(`     Created: ${profile.created_at}`);
        console.log('');
      });
    }
    
    // Check for admin users specifically
    const adminProfiles = profiles.filter(p => p.role === 'admin');
    console.log(`👑 Admin users found: ${adminProfiles.length}`);
    
    if (adminProfiles.length === 0) {
      console.log('❌ No admin users found!');
      console.log('💡 You need to create an admin user first.');
      return;
    }
    
    // Test if we can access the admin user's auth record
    console.log('\n🔐 Testing auth access...');
    const adminId = adminProfiles[0].id;
    
    try {
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminId);
      
      if (authError) {
        console.log('❌ Auth user access error:', authError.message);
      } else {
        console.log('✅ Auth user accessible');
        console.log(`  📧 Email: ${authUser.user.email}`);
        console.log(`  🔑 Confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`  🔒 Last Sign In: ${authUser.user.last_sign_in_at || 'Never'}`);
      }
    } catch (authErr) {
      console.log('❌ Auth error:', authErr.message);
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' })
      .catch(() => ({ data: null, error: 'RPC not available' }));
    
    if (policiesError) {
      console.log('⚠️  Could not check policies via RPC, checking manually...');
      // Try to query policies table directly
      const { data: policyData, error: policyErr } = await supabase
        .from('information_schema.policies')
        .select('*')
        .eq('table_name', 'profiles');
      
      if (policyErr) {
        console.log('❌ Could not check policies:', policyErr.message);
      } else {
        console.log(`📋 Found ${policyData.length} policies for profiles table`);
        policyData.forEach(policy => {
          console.log(`  - ${policy.policy_name}: ${policy.action} ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`);
        });
      }
    } else {
      console.log('✅ Policies check successful');
      console.log('📋 Policies:', policies);
    }
    
    console.log('\n🎯 Next steps:');
    console.log('1. Make sure RLS policies allow service role access');
    console.log('2. Verify admin user has correct role in profiles table');
    console.log('3. Test login again');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAdmin();
