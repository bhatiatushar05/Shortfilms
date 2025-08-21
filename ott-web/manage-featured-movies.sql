-- Featured Movies Management Script
-- Run this in your Supabase SQL Editor

-- 1. First, add the featured column (if not already done)
ALTER TABLE public.titles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- 2. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_titles_is_featured ON public.titles(is_featured);

-- 3. Set a specific movie as featured (example: set "War" as featured)
UPDATE public.titles 
SET is_featured = true 
WHERE title = 'War';

-- 4. Set other movies as not featured
UPDATE public.titles 
SET is_featured = false 
WHERE title != 'War';

-- 5. View current featured status
SELECT 
    title, 
    year, 
    rating, 
    is_featured,
    created_at
FROM public.titles 
ORDER BY is_featured DESC, created_at DESC;

-- 6. To set a different movie as featured, run:
-- UPDATE public.titles SET is_featured = false WHERE is_featured = true;
-- UPDATE public.titles SET is_featured = true WHERE title = 'Your Movie Title';
