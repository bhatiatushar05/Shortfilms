-- Add featured column to titles table
-- Run this in your Supabase SQL Editor

-- Add the is_featured column
ALTER TABLE public.titles 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_titles_is_featured ON public.titles(is_featured);

-- Set the first movie as featured (optional)
UPDATE public.titles 
SET is_featured = true 
WHERE id = (SELECT id FROM public.titles ORDER BY created_at DESC LIMIT 1);

-- Show the current featured status
SELECT id, title, is_featured, created_at 
FROM public.titles 
ORDER BY created_at DESC;
