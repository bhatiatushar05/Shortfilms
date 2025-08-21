-- Fix War Movie Images with REAL Working URLs
-- Run this in your Supabase SQL Editor

-- First, let's see what we currently have
SELECT title, poster_url, hero_url FROM public.titles WHERE title = 'War';

-- Now update with REAL working images
UPDATE public.titles 
SET 
    poster_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=900&fit=crop',
    hero_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop'
WHERE title = 'War';

-- Verify the update worked
SELECT title, poster_url, hero_url FROM public.titles WHERE title = 'War';

-- If the above doesn't work, try these alternative URLs:
-- UPDATE public.titles 
-- SET 
--     poster_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop',
--     hero_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
-- WHERE title = 'War';
