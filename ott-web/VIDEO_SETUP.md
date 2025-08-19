# Video Setup Guide for OTT Platform

This guide explains how to add video content to movies in your OTT application.

## Overview

The OTT platform now supports video playback for movies using HLS (HTTP Live Streaming) format. Videos are stored as URLs in the database and played using the built-in video player.

## Database Setup

### 1. Content Schema

The database already includes a `playback_url` field for movies in the `titles` table:

```sql
CREATE TABLE IF NOT EXISTS public.titles (
    id TEXT PRIMARY KEY,
    kind TEXT CHECK (kind IN ('movie', 'series')) NOT NULL,
    -- ... other fields ...
    playback_url TEXT, -- for movies only
    -- ... other fields ...
);
```

### 2. Adding Video URLs

To add a video to a movie, you need to update the `playback_url` field with an HLS stream URL:

```sql
UPDATE public.titles 
SET playback_url = 'https://your-cdn.com/movies/movie-name/master.m3u8'
WHERE id = 'movie-id' AND kind = 'movie';
```

## Video Requirements

### Format
- **HLS (HTTP Live Streaming)** - `.m3u8` files
- **MP4** - Direct video files (fallback)

### Recommended Specifications
- **Resolution**: 1080p (1920x1080) or 720p (1280x720)
- **Codec**: H.264 for video, AAC for audio
- **Bitrate**: 2-8 Mbps for 1080p, 1-4 Mbps for 720p
- **Frame Rate**: 24fps or 30fps

### HLS Structure
```
https://your-cdn.com/movies/movie-name/
├── master.m3u8          # Main playlist
├── 720p.m3u8           # 720p quality playlist
├── 1080p.m3u8          # 1080p quality playlist
└── segments/
    ├── segment_001.ts   # Video segments
    ├── segment_002.ts
    └── ...
```

## Adding Videos to Movies

### Method 1: Database Update

1. **Prepare your HLS stream** and upload to a CDN
2. **Get the master playlist URL** (e.g., `https://cdn.com/movie.m3u8`)
3. **Update the database**:

```sql
-- Example: Add video to "The Matrix"
UPDATE public.titles 
SET playback_url = 'https://your-cdn.com/movies/matrix/master.m3u8'
WHERE id = 'matrix-1999' AND kind = 'movie';
```

### Method 2: API Endpoint

If you have an admin API, you can create an endpoint to update video URLs:

```javascript
// Example API endpoint
POST /api/admin/movies/:id/video
{
  "playbackUrl": "https://your-cdn.com/movies/movie-name/master.m3u8"
}
```

### Method 3: Mock Data

For development, you can add sample video URLs to your mock data:

```sql
-- Insert sample movie with video
INSERT INTO public.titles (
    id, kind, slug, title, synopsis, year, rating, 
    runtime_sec, genres, poster_url, hero_url, playback_url
) VALUES (
    'sample-movie-1',
    'movie',
    'sample-movie-1',
    'Sample Movie with Video',
    'A sample movie to test video playback',
    2024,
    'U/A 13+',
    7200, -- 2 hours
    ARRAY['Action', 'Adventure'],
    'https://via.placeholder.com/600x900/ef4444/ffffff?text=Poster',
    'https://via.placeholder.com/1920x1080/ef4444/ffffff?text=Hero',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
);
```

## Video Player Features

The built-in video player includes:

- **HLS Support**: Native HLS.js integration
- **Responsive Design**: Works on all screen sizes
- **Progress Tracking**: Saves viewing progress
- **Fullscreen Support**: Native fullscreen API
- **Keyboard Controls**: Space (play/pause), arrows (seek)
- **Touch Controls**: Mobile-friendly interface

## Testing Video Playback

### 1. Check Video URL
Ensure your `playback_url` is accessible and returns valid HLS content.

### 2. Test in Browser
Navigate to `/watch/{movie-id}` to test video playback.

### 3. Verify HLS Support
The player automatically detects HLS support and falls back to MP4 if needed.

## Common Issues

### Video Not Loading
- Check if `playback_url` is set in database
- Verify URL is accessible (no CORS issues)
- Ensure HLS stream is valid

### HLS Not Supported
- The player automatically falls back to MP4
- Consider providing both HLS and MP4 URLs

### Performance Issues
- Use CDN for video delivery
- Implement adaptive bitrate streaming
- Optimize video encoding settings

## CDN Recommendations

Popular CDNs for video hosting:
- **AWS CloudFront** - Global CDN with video optimization
- **Cloudflare** - Affordable CDN with video support
- **Bunny.net** - Specialized video CDN
- **Vimeo** - Professional video hosting with HLS

## Security Considerations

- **CORS**: Ensure your CDN allows requests from your domain
- **Authentication**: Consider implementing signed URLs for premium content
- **Rate Limiting**: Protect against video scraping
- **Geoblocking**: Implement regional restrictions if needed

## Next Steps

1. **Set up a CDN** for video hosting
2. **Convert your videos** to HLS format
3. **Update your database** with video URLs
4. **Test playback** on different devices
5. **Monitor performance** and optimize as needed

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify video URL accessibility
3. Test with sample HLS streams
4. Review HLS.js documentation for advanced configuration

---

**Note**: This guide assumes you have the basic OTT platform running. Make sure your database schema is up to date and the video player components are properly installed.
