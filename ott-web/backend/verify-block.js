/**
 * Quick Verification: Ensure Suspended User is Blocked
 */

const { supabase } = require('./config/database');

async function verifyBlock() {
  console.log('🔍 Quick Verification: Checking if suspended user is blocked...\n');
  
  try {
    const userId = '49639d45-6484-416c-9126-82ad532075dc';
    const email = 'tbhatia442@gmail.com';
    
    console.log(`🔍 Checking user: ${email}`);
    
    // Check Supabase profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('status, subscription')
      .eq('id', userId)
      .single();
    
    if (profileError) {
      console.log('❌ Error checking profile:', profileError.message);
      return;
    }
    
    console.log(`📋 Supabase Profile Status: ${profile.status}`);
    
    // Check user_controls table
    const { data: control, error: controlError } = await supabase
      .from('user_controls')
      .select('status, can_access')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (controlError) {
      console.log('❌ Error checking user controls:', controlError.message);
    } else if (control) {
      console.log(`🎛️ User Controls Status: ${control.status} (Access: ${control.can_access})`);
    } else {
      console.log('ℹ️ No user controls record found');
    }
    
    // Determine if user should be blocked
    let shouldBeBlocked = false;
    let reason = '';
    
    if (profile.status === 'suspended') {
      shouldBeBlocked = true;
      reason = 'Profile status is suspended';
    }
    
    if (control && (control.status === 'suspended' || control.can_access === false)) {
      shouldBeBlocked = true;
      reason = 'User controls indicate suspension';
    }
    
    console.log('\n🎯 BLOCK STATUS:');
    if (shouldBeBlocked) {
      console.log('🚫 USER SHOULD BE BLOCKED');
      console.log(`   Reason: ${reason}`);
      console.log('✅ Login attempts will be blocked');
      console.log('✅ User will see "Access Denied" message');
      console.log('✅ User will stay on login page');
    } else {
      console.log('✅ USER SHOULD HAVE ACCESS');
      console.log('⚠️ This user might be able to login');
    }
    
    console.log('\n🎉 Verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Run verification
verifyBlock().catch(console.error);

