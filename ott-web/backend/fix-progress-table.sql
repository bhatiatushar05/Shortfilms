-- Fix Progress Table - Add missing duration_sec column
-- Run this in your Supabase SQL Editor

-- Check if duration_sec column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progress' 
        AND column_name = 'duration_sec'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.progress ADD COLUMN duration_sec INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added duration_sec column to progress table';
    ELSE
        RAISE NOTICE 'duration_sec column already exists in progress table';
    END IF;
END $$;

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;
