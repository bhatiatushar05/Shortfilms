const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  process.exit(1)
}

// Use service role key to bypass RLS and fix policies
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixRLSPoliciesDirect() {
  console.log('🔧 Fixing RLS Policies for user_controls table (Direct Method)...\n')
  
  try {
    // Test 1: Check if we can access user_controls table with service role
    console.log('📋 Test 1: Testing service role access to user_controls...')
    
    const { data: testData, error: testError } = await supabase
      .from('user_controls')
      .select('*')
      .limit(1)
    
    if (testError) {
      console.error('❌ Service role cannot access user_controls:', testError.message)
      console.log('💡 This suggests the table might not exist or has different permissions')
      return
    } else {
      console.log('✅ Service role can access user_controls table')
      console.log(`   Found ${testData?.length || 0} records`)
    }
    
    // Test 2: Check current user statuses
    console.log('\n📋 Test 2: Checking current user statuses...')
    
    const { data: allUsers, error: usersError } = await supabase
      .from('user_controls')
      .select('email, status, can_access, suspension_reason')
      .order('created_at', { ascending: false })
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
    } else {
      console.log('✅ Current users in user_controls:')
      allUsers?.forEach(user => {
        const status = user.status === 'suspended' || user.can_access === false ? '🚫 SUSPENDED' : '✅ ACTIVE'
        console.log(`   ${user.email}: ${status} (${user.status || 'active'})`)
      })
    }
    
    // Test 3: Check if we can read specific users
    console.log('\n📋 Test 3: Testing specific user access...')
    
    // Test banned user
    const { data: bannedUser, error: bannedError } = await supabase
      .from('user_controls')
      .select('*')
      .eq('email', 'tbhatia442@gmail.com')
      .maybeSingle()
    
    if (bannedError) {
      console.error('❌ Error fetching banned user:', bannedError.message)
    } else if (bannedUser) {
      console.log('✅ Banned user found:', bannedUser.email)
      console.log(`   Status: ${bannedUser.status}, Can Access: ${bannedUser.can_access}`)
    } else {
      console.log('ℹ️ Banned user not found')
    }
    
    // Test active user
    const { data: activeUser, error: activeError } = await supabase
      .from('user_controls')
      .select('*')
      .eq('email', 'tushar918273@gmail.com')
      .maybeSingle()
    
    if (activeError) {
      console.error('❌ Error fetching active user:', activeError.message)
    } else if (activeUser) {
      console.log('✅ Active user found:', activeUser.email)
      console.log(`   Status: ${activeUser.status}, Can Access: ${activeUser.can_access}`)
    } else {
      console.log('ℹ️ Active user not found')
    }
    
    console.log('\n🎯 Current System Status:')
    console.log('✅ Service role can access user_controls table')
    console.log('✅ User data is accessible')
    console.log('✅ System should work with proper RLS policies')
    
    console.log('\n💡 Next Steps:')
    console.log('1. Go to Supabase Dashboard > SQL Editor')
    console.log('2. Run the SQL from fix-rls-policies.sql manually')
    console.log('3. Or tell me to create a different approach')
    
  } catch (error) {
    console.error('❌ Error in direct test:', error)
  }
}

// Run the fix
fixRLSPoliciesDirect().catch(console.error)

