-- =====================================================
-- FIX DATABASE PERMISSIONS
-- =====================================================

-- 1. Disable RLS on ALL tables
ALTER TABLE titles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seasons DISABLE ROW LEVEL SECURITY;
ALTER TABLE episodes DISABLE ROW LEVEL SECURITY;
ALTER TABLE people DISABLE ROW LEVEL SECURITY;
ALTER TABLE credits DISABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 2. Grant ALL permissions to public (anon and authenticated)
GRANT ALL ON titles TO anon, authenticated;
GRANT ALL ON seasons TO anon, authenticated;
GRANT ALL ON episodes TO anon, authenticated;
GRANT ALL ON people TO anon, authenticated;
GRANT ALL ON credits TO anon, authenticated;
GRANT ALL ON watchlist TO anon, authenticated;
GRANT ALL ON progress TO anon, authenticated;
GRANT ALL ON reviews TO anon, authenticated;

-- 3. Grant permissions on the view
GRANT SELECT ON v_title_summary TO anon, authenticated;

-- 4. Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- 5. Grant permissions on sequences (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
