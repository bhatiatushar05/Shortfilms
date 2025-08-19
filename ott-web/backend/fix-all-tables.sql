-- Fix All Missing Tables and Columns
-- Run this in your Supabase SQL Editor

-- 1. Create progress table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT NOT NULL,
    position_sec INTEGER DEFAULT 0 NOT NULL,
    duration_sec INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, title_id)
);

-- 2. Create watchlist table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, title_id)
);

-- 3. Add missing columns to progress table if they don't exist
DO $$ 
BEGIN
    -- Add duration_sec if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progress' 
        AND column_name = 'duration_sec'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.progress ADD COLUMN duration_sec INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added duration_sec column to progress table';
    END IF;
    
    -- Add position_sec if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progress' 
        AND column_name = 'position_sec'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.progress ADD COLUMN position_sec INTEGER DEFAULT 0 NOT NULL;
        RAISE NOTICE 'Added position_sec column to progress table';
    END IF;
    
    -- Add updated_at if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'progress' 
        AND column_name = 'updated_at'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.progress ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
        RAISE NOTICE 'Added updated_at column to progress table';
    END IF;
END $$;

-- 4. Enable RLS on tables
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- 5. Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_title_id ON public.progress(title_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_title_id ON public.watchlist(title_id);

-- 6. Create or replace functions
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

CREATE OR REPLACE FUNCTION public.add_to_watchlist(p_title_id TEXT)
RETURNS void AS $$
BEGIN
    INSERT INTO public.watchlist (user_id, title_id)
    VALUES (auth.uid(), p_title_id)
    ON CONFLICT (user_id, title_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.remove_from_watchlist(p_title_id TEXT)
RETURNS void AS $$
BEGIN
    DELETE FROM public.watchlist 
    WHERE user_id = auth.uid() AND title_id = p_title_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT ALL ON public.progress TO authenticated;
GRANT ALL ON public.watchlist TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_progress(TEXT, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_watchlist(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_from_watchlist(TEXT) TO authenticated;

-- 8. Create policies
DROP POLICY IF EXISTS "Users can view their own progress" ON public.progress;
CREATE POLICY "Users can view their own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own progress" ON public.progress;
CREATE POLICY "Users can insert into their own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own progress" ON public.progress;
CREATE POLICY "Users can update their own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own progress" ON public.progress;
CREATE POLICY "Users can delete from their own progress" ON public.progress
    FOR DELETE USING (auth.uid() = user_id);

-- Watchlist policies
DROP POLICY IF EXISTS "Users can view their own watchlist" ON public.watchlist;
CREATE POLICY "Users can view their own watchlist" ON public.watchlist
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into their own watchlist" ON public.watchlist;
CREATE POLICY "Users can insert into their own watchlist" ON public.watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own watchlist" ON public.watchlist;
CREATE POLICY "Users can update their own watchlist" ON public.watchlist
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from their own watchlist" ON public.watchlist;
CREATE POLICY "Users can delete from their own watchlist" ON public.watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- 9. Verify the fix
SELECT 'Progress table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'progress' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Watchlist table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'watchlist' 
AND table_schema = 'public'
ORDER BY ordinal_position;
