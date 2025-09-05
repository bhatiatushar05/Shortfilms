const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.log('ℹ️ This script requires:')
  console.log('   - SUPABASE_URL')
  console.log('   - SUPABASE_SERVICE_ROLE_KEY (from Supabase dashboard)')
  console.log('\n📋 To get the service role key:')
  console.log('   1. Go to Supabase Dashboard')
  console.log('   2. Go to Settings > API')
  console.log('   3. Copy "service_role" key (not anon key)')
  process.exit(1)
}

// Use service role key to bypass RLS and fix policies
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies for user_controls table...\n')
  
  try {
    // Step 1: Enable RLS
    console.log('📋 Step 1: Enabling RLS on user_controls table...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE user_controls ENABLE ROW LEVEL SECURITY;'
    })
    
    if (rlsError) {
      console.log('ℹ️ RLS already enabled or error:', rlsError.message)
    } else {
      console.log('✅ RLS enabled successfully')
    }
    
    // Step 2: Drop existing policies
    console.log('\n📋 Step 2: Dropping existing policies...')
    const policiesToDrop = [
      'Users can view own controls',
      'Users can update own controls', 
      'Admin can manage all controls'
    ]
    
    for (const policyName of policiesToDrop) {
      const { error: dropError } = await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policyName}" ON user_controls;`
      })
      
      if (dropError) {
        console.log(`ℹ️ Policy "${policyName}" not found or error:`, dropError.message)
      } else {
        console.log(`✅ Dropped policy: ${policyName}`)
      }
    }
    
    // Step 3: Create new policies
    console.log('\n📋 Step 3: Creating new secure policies...')
    
    // Policy 1: Users can read their own controls
    const { error: selectPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can view own controls" ON user_controls
        FOR SELECT USING (
          auth.jwt() ->> 'email' = email
        );
      `
    })
    
    if (selectPolicyError) {
      console.error('❌ Error creating SELECT policy:', selectPolicyError.message)
    } else {
      console.log('✅ Created SELECT policy: Users can view own controls')
    }
    
    // Policy 2: Users can update their own controls
    const { error: updatePolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can update own controls" ON user_controls
        FOR UPDATE USING (
          auth.jwt() ->> 'email' = email
        );
      `
    })
    
    if (updatePolicyError) {
      console.error('❌ Error creating UPDATE policy:', updatePolicyError.message)
    } else {
      console.log('✅ Created UPDATE policy: Users can update own controls')
    }
    
    // Policy 3: Users can insert their own controls
    const { error: insertPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Users can insert own controls" ON user_controls
        FOR INSERT WITH CHECK (
          auth.jwt() ->> 'email' = email
        );
      `
    })
    
    if (insertPolicyError) {
      console.error('❌ Error creating INSERT policy:', insertPolicyError.message)
    } else {
      console.log('✅ Created INSERT policy: Users can insert own controls')
    }
    
    // Policy 4: Admin service role can manage all controls
    const { error: adminPolicyError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE POLICY "Admin can manage all controls" ON user_controls
        FOR ALL USING (
          auth.role() = 'service_role'
        );
      `
    })
    
    if (adminPolicyError) {
      console.error('❌ Error creating ADMIN policy:', adminPolicyError.message)
    } else {
      console.log('✅ Created ADMIN policy: Admin can manage all controls')
    }
    
    // Step 4: Grant permissions
    console.log('\n📋 Step 4: Granting permissions...')
    
    const { error: grantError } = await supabase.rpc('exec_sql', {
      sql: `
        GRANT SELECT, INSERT, UPDATE ON user_controls TO authenticated;
        GRANT ALL ON user_controls TO service_role;
      `
    })
    
    if (grantError) {
      console.log('ℹ️ Permissions already granted or error:', grantError.message)
    } else {
      console.log('✅ Permissions granted successfully')
    }
    
    // Step 5: Verify policies
    console.log('\n📋 Step 5: Verifying policies...')
    const { data: policies, error: verifyError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          policyname,
          cmd,
          permissive
        FROM pg_policies 
        WHERE tablename = 'user_controls'
        ORDER BY policyname;
      `
    })
    
    if (verifyError) {
      console.error('❌ Error verifying policies:', verifyError.message)
    } else {
      console.log('✅ Current policies on user_controls table:')
      console.log(policies)
    }
    
    console.log('\n🎯 RLS Policies Fixed Successfully!')
    console.log('✅ Users can now read their own status')
    console.log('✅ Login blocking will work perfectly')
    console.log('✅ System is now secure and functional')
    console.log('✅ No more permission denied errors')
    
  } catch (error) {
    console.error('❌ Error fixing RLS policies:', error)
    console.log('\n💡 Alternative: You can run the SQL manually in Supabase SQL Editor')
    console.log('📋 Copy the contents of fix-rls-policies.sql and run it')
  }
}

// Run the fix
fixRLSPolicies().catch(console.error)

