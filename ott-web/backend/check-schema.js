require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 Checking exact database structure...');
    
    // Check if we can access the information_schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .eq('table_name', 'titles');
    
    if (tablesError) {
      console.log('❌ Cannot access information_schema:', tablesError.message);
      
      // Try a different approach - check if tables exist and their structure
      console.log('\n🔍 Trying alternative approach...');
      
      // Check if titles table exists and try to get sample data
      const { data: sampleTitle, error: titleError } = await supabase
        .from('titles')
        .select('*')
        .limit(1);
      
      if (titleError) {
        console.log('❌ Error accessing titles table:', titleError.message);
      } else {
        console.log('✅ Titles table accessible');
        if (sampleTitle && sampleTitle.length > 0) {
          console.log('📊 Sample title structure:');
          Object.keys(sampleTitle[0]).forEach(key => {
            const value = sampleTitle[0][key];
            console.log(`  ${key}: ${typeof value} (${value})`);
          });
        }
      }
      
      // Check if episodes table exists
      const { data: sampleEpisode, error: episodeError } = await supabase
        .from('episodes')
        .select('*')
        .limit(1);
      
      if (episodeError) {
        console.log('❌ Error accessing episodes table:', episodeError.message);
      } else {
        console.log('✅ Episodes table accessible');
        if (sampleEpisode && sampleEpisode.length > 0) {
          console.log('📊 Sample episode structure:');
          Object.keys(sampleEpisode[0]).forEach(key => {
            const value = sampleEpisode[0][key];
            console.log(`  ${key}: ${typeof value} (${value})`);
          });
        }
      }
      
    } else {
      console.log('✅ Can access information_schema');
      console.log('📊 Tables found:', tables);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSchema();
