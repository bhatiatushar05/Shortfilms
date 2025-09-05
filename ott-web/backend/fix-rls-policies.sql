-- Fix RLS Policies for user_controls table
-- This will allow authenticated users to read their own status
-- while maintaining security and preventing unauthorized access

-- Step 1: Enable RLS on user_controls table (if not already enabled)
ALTER TABLE user_controls ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing restrictive policies (if any)
DROP POLICY IF EXISTS "Users can view own controls" ON user_controls;
DROP POLICY IF EXISTS "Users can update own controls" ON user_controls;
DROP POLICY IF EXISTS "Admin can manage all controls" ON user_controls;

-- Step 3: Create new secure policies

-- Policy 1: Users can read their own user_controls record
CREATE POLICY "Users can view own controls" ON user_controls
FOR SELECT USING (
  auth.jwt() ->> 'email' = email
);

-- Policy 2: Users can update their own user_controls record (for profile updates)
CREATE POLICY "Users can update own controls" ON user_controls
FOR UPDATE USING (
  auth.jwt() ->> 'email' = email
);

-- Policy 3: Users can insert their own user_controls record (for signup)
CREATE POLICY "Users can insert own controls" ON user_controls
FOR INSERT WITH CHECK (
  auth.jwt() ->> 'email' = email
);

-- Policy 4: Admin service role can manage all controls (for admin dashboard)
CREATE POLICY "Admin can manage all controls" ON user_controls
FOR ALL USING (
  auth.role() = 'service_role'
);

-- Step 4: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_controls TO authenticated;
GRANT ALL ON user_controls TO service_role;

-- Step 5: Verify the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_controls';

-- Step 6: Test the policies work
-- This should return the current user's controls if authenticated
-- SELECT * FROM user_controls WHERE email = auth.jwt() ->> 'email';

