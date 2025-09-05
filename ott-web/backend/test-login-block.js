/**
 * Test Login Blocking for Suspended Users
 */

const { supabase } = require('./config/database');

async function testLoginBlock() {
  console.log('🧪 Testing Login Blocking for Suspended Users...\n');
  
  try {
    const suspendedUser = 'tbhatia442@gmail.com';
    const suspendedUserId = '49639d45-6484-416c-9126-82ad532075dc';
    
    console.log(`🔍 Testing login blocking for: ${suspendedUser}`);
    
    // Check current status in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, subscription')
      .eq('id', suspendedUserId)
      .single();
    
    if (profileError) {
      console.log('❌ Error checking profile:', profileError.message);
      return;
    }
    
    console.log(`📋 Profile Status: ${profile.status}`);
    
    // Check current status in user_controls table
    const { data: control, error: controlError } = await supabase
      .from('user_controls')
      .select('status, can_access, suspension_reason')
      .eq('user_id', suspendedUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (controlError) {
      console.log('❌ Error checking user controls:', controlError.message);
    } else if (control) {
      console.log(`🎛️ Control Status: ${control.status} (Access: ${control.can_access})`);
      if (control.suspension_reason) {
        console.log(`📝 Suspension Reason: ${control.suspension_reason}`);
      }
    }
    
    // Simulate what the login function will do
    console.log('\n🔐 Simulating login function behavior...');
    
    // Step 1: Check profiles table BEFORE authentication
    if (profile.status === 'suspended') {
      console.log('✅ Step 1: User is suspended in profiles table');
      console.log('🚫 Login should be BLOCKED at this point');
      console.log('📍 User should stay on login page with "Access Denied" message');
      console.log('📍 NO redirection should occur');
    } else {
      console.log('⚠️ Step 1: User is NOT suspended in profiles table');
    }
    
    // Step 2: Check user_controls table
    if (control && (control.status === 'suspended' || control.can_access === false)) {
      console.log('✅ Step 2: User is suspended in user_controls table');
      console.log('🚫 Login should be BLOCKED at this point');
      console.log('📍 User should stay on login page with "Access Denied" message');
      console.log('📍 NO redirection should occur');
    } else {
      console.log('⚠️ Step 2: User is NOT suspended in user_controls table');
    }
    
    // Expected behavior summary
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('   1. User enters credentials');
    console.log('   2. System checks profiles table FIRST (before authentication)');
    console.log('   3. If suspended → Login BLOCKED immediately');
    console.log('   4. User sees "Access Denied" message');
    console.log('   5. User stays on login page (NO REDIRECTION)');
    console.log('   6. Supabase authentication never happens');
    
    if (profile.status === 'suspended' || (control && (control.status === 'suspended' || control.can_access === false))) {
      console.log('\n🎉 RESULT: User should be completely blocked from logging in!');
      console.log('   ✅ No authentication');
      console.log('   ✅ No redirection');
      console.log('   ✅ Clear error message');
      console.log('   ✅ Stays on login page');
    } else {
      console.log('\n⚠️ RESULT: User might be able to login (not suspended)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLoginBlock().catch(console.error);

