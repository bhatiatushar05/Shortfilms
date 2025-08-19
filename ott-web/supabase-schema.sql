-- Supabase Database Schema for OTT Platform
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create watchlist table
CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT NOT NULL,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, title_id)
);

-- Create progress table
CREATE TABLE IF NOT EXISTS public.progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title_id TEXT NOT NULL,
    position_sec INTEGER DEFAULT 0 NOT NULL,
    duration_sec INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, title_id)
);

-- Enable RLS on tables
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_title_id ON public.watchlist(title_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_title_id ON public.progress(title_id);

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist" ON public.watchlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own watchlist" ON public.watchlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist" ON public.watchlist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own watchlist" ON public.watchlist
    FOR DELETE USING (auth.uid() = user_id);

-- Progress policies
CREATE POLICY "Users can view their own progress" ON public.progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own progress" ON public.progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own progress" ON public.progress
    FOR DELETE USING (auth.uid() = user_id);

-- Create functions for common operations
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.watchlist TO authenticated;
GRANT ALL ON public.progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_to_watchlist(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_from_watchlist(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_progress(TEXT, INTEGER, INTEGER) TO authenticated;
