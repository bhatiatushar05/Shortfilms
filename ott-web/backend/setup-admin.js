require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🚀 ShortCinema Admin Setup Script');
console.log('================================');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('\n📋 Please add to your .env file:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.log('\n🔑 To get your service role key:');
  console.log('1. Go to https://supabase.com/dashboard/project/zefhgbbaohovxngsxwlv');
  console.log('2. Navigate to Settings → API');
  console.log('3. Copy the "service_role" key (not the anon key)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdmin() {
  try {
    console.log('\n🔍 Testing connection...');
    
    // Test connection
    const { data, error } = await supabase
      .from('titles')
      .select('count')
      .limit(1);
    
    if (error && !error.message.includes('relation "titles" does not exist')) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // Check if profiles table exists
    console.log('\n🔍 Checking database schema...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError && profilesError.message.includes('relation "profiles" does not exist')) {
      console.log('⚠️  Profiles table does not exist');
      console.log('📋 Please run the database schema first:');
      console.log('1. Go to your Supabase SQL Editor');
      console.log('2. Copy and paste the contents of supabase-admin-schema.sql');
      console.log('3. Run the SQL commands');
      return;
    }
    
    console.log('✅ Database schema is ready');
    
    // Check if admin user exists
    console.log('\n🔍 Checking for admin user...');
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminError) {
      console.error('❌ Error checking admin user:', adminError.message);
      return;
    }
    
    if (adminUser && adminUser.length > 0) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email:', adminUser[0].email);
      console.log('👑 Role:', adminUser[0].role);
    } else {
      console.log('⚠️  No admin user found');
      console.log('\n📋 To create an admin user:');
      console.log('1. Go to Supabase Auth → Users');
      console.log('2. Create a new user with your admin email');
      console.log('3. Copy the user ID (UUID)');
      console.log('4. Run this SQL in the SQL Editor:');
      console.log(`
INSERT INTO public.profiles (id, email, role) 
VALUES ('USER_ID_HERE', 'admin@shortcinema.com', 'admin');
      `);
    }
    
    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure you have the service role key in .env');
    console.log('2. Run the database schema in Supabase SQL Editor');
    console.log('3. Create an admin user');
    console.log('4. Start the backend: npm run dev');
    
  } catch (error) {
    console.error('❌ Setup error:', error.message);
  }
}

setupAdmin();
