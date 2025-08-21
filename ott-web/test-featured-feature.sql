-- Test Featured Feature
-- Run this in your Supabase SQL Editor to test

-- 1. Check current featured status
SELECT 
    title, 
    year, 
    rating, 
    is_featured,
    created_at
FROM public.titles 
ORDER BY is_featured DESC, created_at DESC;

-- 2. Set "War" as featured
UPDATE public.titles 
SET is_featured = true 
WHERE title = 'War';

-- 3. Set all others as not featured
UPDATE public.titles 
SET is_featured = false 
WHERE title != 'War';

-- 4. Verify the change
SELECT 
    title, 
    year, 
    rating, 
    is_featured,
    created_at
FROM public.titles 
ORDER BY is_featured DESC, created_at DESC;

-- 5. To change featured movie, run:
-- UPDATE public.titles SET is_featured = false WHERE is_featured = true;
-- UPDATE public.titles SET is_featured = true WHERE title = 'The Dark Knight';
