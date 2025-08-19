-- Fix Progress Table Constraint Issues
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT 'Current progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for any existing records with NULL duration_sec
SELECT 'Records with NULL duration_sec:' as info;
SELECT COUNT(*) as null_duration_count
FROM public.progress 
WHERE duration_sec IS NULL;

-- Update any existing NULL values to 0
UPDATE public.progress 
SET duration_sec = 0 
WHERE duration_sec IS NULL;

-- Ensure the column has proper constraints
ALTER TABLE public.progress 
ALTER COLUMN duration_sec SET NOT NULL,
ALTER COLUMN duration_sec SET DEFAULT 0;

-- Also ensure position_sec has proper constraints
ALTER TABLE public.progress 
ALTER COLUMN position_sec SET NOT NULL,
ALTER COLUMN position_sec SET DEFAULT 0;

-- Verify the final table structure
SELECT 'Final progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test the constraints
SELECT 'Testing constraints...' as info;
INSERT INTO public.progress (user_id, title_id, position_sec, duration_sec) 
VALUES ('00000000-0000-0000-0000-000000000000', 'test-title', 0, 0)
ON CONFLICT (user_id, title_id) DO NOTHING;

SELECT 'Progress table constraints fixed successfully!' as info;
