-- Complete Fix for Progress Table - Add ALL missing columns
-- Run this in your Supabase SQL Editor

-- First, let's see what columns currently exist
SELECT 'Current progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Drop the existing progress table completely and recreate it
DROP TABLE IF EXISTS public.progress CASCADE;

-- Create the progress table with ALL required columns
CREATE TABLE public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT NOT NULL,
    position_sec INTEGER DEFAULT 0 NOT NULL,
    duration_sec INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, title_id)
);

-- Enable RLS
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_progress_user_id ON public.progress(user_id);
CREATE INDEX idx_progress_title_id ON public.progress(title_id);

-- Create policies
CREATE POLICY "Users can view their own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own progress" ON public.progress
    FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.progress TO authenticated;

-- Create the update_progress function
CREATE OR REPLACE FUNCTION public.update_progress(p_title_id TEXT, p_position_sec INTEGER, p_duration_sec INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO public.progress (user_id, title_id, position_sec, duration_sec)
    VALUES (auth.uid(), p_title_id, p_position_sec, p_duration_sec)
    ON CONFLICT (user_id, title_id) 
    DO UPDATE SET 
        position_sec = EXCLUDED.position_sec,
        duration_sec = EXCLUDED.duration_sec,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_progress(TEXT, INTEGER, INTEGER) TO authenticated;

-- Verify the final table structure
SELECT 'Final progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test the function (this will create a test record)
SELECT 'Testing update_progress function...' as info;
SELECT public.update_progress('test-title-id', 30, 120) as test_result;
SELECT 'Test completed. Check if any errors occurred above.' as info;
