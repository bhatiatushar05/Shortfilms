-- Supabase Content Database Schema for OTT Platform
-- Run this in your Supabase SQL Editor

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create titles table
CREATE TABLE IF NOT EXISTS public.titles (
    id TEXT PRIMARY KEY,
    kind TEXT CHECK (kind IN ('movie', 'series')) NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    year INTEGER NOT NULL,
    rating TEXT NOT NULL,
    runtime_sec INTEGER, -- NULL for series
    genres TEXT[] NOT NULL DEFAULT '{}',
    tags TEXT[] NOT NULL DEFAULT '{}',
    poster_url TEXT NOT NULL,
    hero_url TEXT NOT NULL,
    trailer_url TEXT, -- optional
    playback_url TEXT, -- for movies only
    subtitles JSONB DEFAULT '[]', -- array of {lang, url, label}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Validation constraints
    CONSTRAINT movie_has_runtime CHECK (
        (kind = 'movie' AND runtime_sec IS NOT NULL AND playback_url IS NOT NULL) OR
        (kind = 'series' AND runtime_sec IS NULL AND playback_url IS NULL)
    )
);

-- Create seasons table
CREATE TABLE IF NOT EXISTS public.seasons (
    id TEXT PRIMARY KEY,
    title_id TEXT REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
    season_number INTEGER NOT NULL,
    overview TEXT,
    
    UNIQUE(title_id, season_number)
);

-- Create episodes table
CREATE TABLE IF NOT EXISTS public.episodes (
    id TEXT PRIMARY KEY,
    title_id TEXT REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
    season_number INTEGER NOT NULL,
    episode_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    synopsis TEXT NOT NULL,
    runtime_sec INTEGER NOT NULL,
    playback_url TEXT NOT NULL,
    subtitles JSONB DEFAULT '[]', -- array of {lang, url, label}
    
    UNIQUE(title_id, season_number, episode_number)
);

-- Create people table (future use)
CREATE TABLE IF NOT EXISTS public.people (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{}',
    photo_url TEXT
);

-- Create credits table (future use)
CREATE TABLE IF NOT EXISTS public.credits (
    title_id TEXT REFERENCES public.titles(id) ON DELETE CASCADE NOT NULL,
    person_id TEXT REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
    job TEXT CHECK (job IN ('cast', 'crew')) NOT NULL,
    
    PRIMARY KEY (title_id, person_id, job)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_titles_slug ON public.titles(slug);
CREATE INDEX IF NOT EXISTS idx_titles_year ON public.titles(year);
CREATE INDEX IF NOT EXISTS idx_titles_genres ON public.titles USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_titles_created_at ON public.titles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_titles_kind ON public.titles(kind);
CREATE INDEX IF NOT EXISTS idx_titles_rating ON public.titles(rating);

CREATE INDEX IF NOT EXISTS idx_seasons_title_id ON public.seasons(title_id);
CREATE INDEX IF NOT EXISTS idx_seasons_season_number ON public.seasons(season_number);

CREATE INDEX IF NOT EXISTS idx_episodes_title_id ON public.episodes(title_id);
CREATE INDEX IF NOT EXISTS idx_episodes_season_episode ON public.episodes(title_id, season_number, episode_number);

-- Enable RLS on tables
ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog
CREATE POLICY "Public can view titles" ON public.titles
    FOR SELECT USING (true);

CREATE POLICY "Public can view seasons" ON public.seasons
    FOR SELECT USING (true);

CREATE POLICY "Public can view episodes" ON public.episodes
    FOR SELECT USING (true);

-- Create view for title summary (used in lists)
CREATE OR REPLACE VIEW public.v_title_summary AS
SELECT 
    t.id,
    t.kind,
    t.slug,
    t.title,
    t.year,
    t.genres,
    t.poster_url,
    t.rating,
    t.runtime_sec,
    CASE 
        WHEN t.kind = 'series' THEN (
            SELECT COUNT(*)::INTEGER 
            FROM public.seasons s 
            WHERE s.title_id = t.id
        )
        ELSE NULL
    END as season_count
FROM public.titles t;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.titles TO authenticated;
GRANT SELECT ON public.titles TO anon;
GRANT SELECT ON public.seasons TO authenticated;
GRANT SELECT ON public.seasons TO anon;
GRANT SELECT ON public.episodes TO authenticated;
GRANT SELECT ON public.episodes TO anon;
GRANT SELECT ON public.v_title_summary TO authenticated;
GRANT SELECT ON public.v_title_summary TO anon;
