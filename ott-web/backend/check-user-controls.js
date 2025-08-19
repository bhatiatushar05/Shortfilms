const { supabase } = require('./config/database');

async function checkUserControls() {
  console.log('🔍 Checking user_controls table directly...\n');

  try {
    // Check all records in user_controls
    const { data: allControls, error: allError } = await supabase
      .from('user_controls')
      .select('*');

    if (allError) {
      console.log('❌ Error fetching all controls:', allError.message);
      return;
    }

    console.log('📊 All user_controls records:');
    console.log(JSON.stringify(allControls, null, 2));

    // Check specific user
    const userId = '49639d45-6484-416c-9126-82ad532075dc';
    const { data: userControl, error: userError } = await supabase
      .from('user_controls')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.log(`❌ Error fetching user ${userId}:`, userError.message);
    } else {
      console.log(`\n👤 User ${userId} control record:`);
      console.log(JSON.stringify(userControl, null, 2));
      
      if (userControl) {
        console.log(`\n🔍 Analysis:`);
        console.log(`   - Status: ${userControl.status}`);
        console.log(`   - Can Access: ${userControl.can_access}`);
        console.log(`   - Can Access Type: ${typeof userControl.can_access}`);
        console.log(`   - Can Access !== false: ${userControl.can_access !== false}`);
        console.log(`   - Suspended At: ${userControl.suspended_at}`);
      }
    }

  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

// Run the check
checkUserControls();
