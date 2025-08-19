-- Example: How to Add Video URLs to Movies
-- Run these commands in your Supabase SQL Editor

-- 1. Check existing movies and their current playback URLs
SELECT id, title, kind, playback_url 
FROM public.titles 
WHERE kind = 'movie' 
LIMIT 5;

-- 2. Add a real video URL to an existing movie
-- Replace 'movie-1' with the actual movie ID you want to update
-- Replace the URL with your actual video URL

UPDATE public.titles 
SET playback_url = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
WHERE id = 'movie-1' AND kind = 'movie';

-- 3. Add multiple video URLs at once
UPDATE public.titles 
SET playback_url = CASE 
    WHEN id = 'movie-1' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    WHEN id = 'movie-2' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
    WHEN id = 'movie-3' THEN 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4'
    ELSE playback_url
END
WHERE id IN ('movie-1', 'movie-2', 'movie-3') AND kind = 'movie';

-- 4. Add a movie with video from scratch
INSERT INTO public.titles (
    id, kind, slug, title, synopsis, year, rating, 
    runtime_sec, genres, poster_url, hero_url, playback_url
) VALUES (
    'sample-video-movie',
    'movie',
    'sample-video-movie',
    'Sample Movie with Real Video',
    'A sample movie to test video playback functionality',
    2024,
    'U/A 13+',
    7200, -- 2 hours
    ARRAY['Action', 'Adventure'],
    'https://via.placeholder.com/600x900/ef4444/ffffff?text=Sample+Video',
    'https://via.placeholder.com/1920x1080/ef4444/ffffff?text=Sample+Video+Hero',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
);

-- 5. Verify the video URLs were added
SELECT id, title, kind, playback_url 
FROM public.titles 
WHERE playback_url IS NOT NULL AND kind = 'movie'
ORDER BY created_at DESC;

-- 6. Test video playback
-- After adding video URLs, navigate to /watch/{movie-id} in your app
-- For example: /watch/sample-video-movie

-- 7. Remove a video URL (if needed)
UPDATE public.titles 
SET playback_url = NULL
WHERE id = 'sample-video-movie';

-- 8. Clean up (remove the sample movie)
DELETE FROM public.titles 
WHERE id = 'sample-video-movie';

-- Notes:
-- - The sample video URLs above are from sample-videos.com (free test videos)
-- - For production, use your own video hosting service (CDN, Vimeo, etc.)
-- - HLS (.m3u8) format is recommended for better streaming experience
-- - MP4 files work as fallback but don't support adaptive bitrate
-- - Make sure your video URLs are accessible and don't have CORS restrictions
