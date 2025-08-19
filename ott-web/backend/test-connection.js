require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      
      if (error.message.includes('relation "titles" does not exist')) {
        console.log('ℹ️  Titles table does not exist yet - this is expected');
        console.log('✅ Basic connection successful');
      } else {
        console.error('❌ Unexpected error:', error);
      }
    } else {
      console.log('✅ Connection successful');
      console.log('📊 Data:', data);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();
