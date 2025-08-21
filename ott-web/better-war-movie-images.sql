-- Better War Movie Images - Multiple Options
-- Run this in your Supabase SQL Editor

-- Option 1: Military/Action Theme (Recommended)
UPDATE public.titles 
SET 
    poster_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop',
    hero_url = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop'
WHERE title = 'War';

-- Check the result
SELECT title, poster_url, hero_url FROM public.titles WHERE title = 'War';

-- If you want to try different images, uncomment one of these:

-- Option 2: More Dramatic Action
-- UPDATE public.titles 
-- SET 
--     poster_url = 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=600&h=900&fit=crop',
--     hero_url = 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=1920&h=1080&fit=crop'
-- WHERE title = 'War';

-- Option 3: Intense Action Scene
-- UPDATE public.titles 
-- SET 
--     poster_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=900&fit=crop',
--     hero_url = 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop'
-- WHERE title = 'War';
