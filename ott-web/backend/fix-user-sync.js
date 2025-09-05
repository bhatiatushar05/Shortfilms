/**
 * Quick Fix: Sync User Status Between Admin System and Supabase
 */

const { supabase } = require('./config/database');

async function fixUserSync() {
  console.log('🔧 Quick Fix: Syncing User Status...\n');
  
  try {
    // Get current admin system status for tbhatia442
    const userId = '49639d45-6484-416c-9126-82ad532075dc';
    const email = 'tbhatia442@gmail.com';
    
    console.log(`🔍 Fixing user: ${email}`);
    
    // Update Supabase profiles table to match admin system (suspended)
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({
        status: 'suspended',
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (updateError) {
      console.log('❌ Error updating profile:', updateError.message);
      return;
    }
    
    console.log('✅ Profile updated successfully!');
    console.log(`   New Status: ${updateData.status}`);
    console.log(`   Updated: ${updateData.updated_at}`);
    
    // Verify the update
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (verifyError) {
      console.log('❌ Error verifying profile:', verifyError.message);
    } else {
      console.log('✅ Profile verification successful:');
      console.log(`   Status: ${verifyProfile.status}`);
      console.log(`   Email: ${verifyProfile.email}`);
      
      if (verifyProfile.status === 'suspended') {
        console.log('🎉 User is now properly suspended in Supabase!');
        console.log('🚫 They will be blocked from logging in and accessing the platform.');
      }
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixUserSync().catch(console.error);

