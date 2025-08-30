import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Play, Heart, Plus, Star, Clock, Calendar, Film, Tv } from 'lucide-react';
import { cn } from '../../utils/cn';

const HeroSection = ({ title }) => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef(null);
  const autoPlayTimeoutRef = useRef(null);
  const autoStopTimeoutRef = useRef(null);

  // Resolve video URL once per render
  const videoUrl = title?.video_url || title?.playback_url || null;

  // Start auto-play after 2s when we have a video URL
  useEffect(() => {
    if (!title || !videoUrl) return;

    autoPlayTimeoutRef.current = setTimeout(() => {
      setShowVideo(true);
    }, 1500); // 2 seconds

    return () => {
      if (autoPlayTimeoutRef.current) clearTimeout(autoPlayTimeoutRef.current);
    };
  }, [title, videoUrl]);

  // When video element is mounted and visible, ensure muted, play, and stop after 15s
  useEffect(() => {
    if (!showVideo || !videoUrl) return;

    const el = videoRef.current;
    if (el) {
      el.muted = true;
      el.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Silently handle play errors
        });
    }

    autoStopTimeoutRef.current = setTimeout(() => {
      setShowVideo(false);
      setIsPlaying(false);
    }, 15000); // 15 seconds

    return () => {
      if (autoStopTimeoutRef.current) clearTimeout(autoStopTimeoutRef.current);
    };
  }, [showVideo, videoUrl]);

  // Simple scroll detection to pause video
  useEffect(() => {
    const handleScroll = () => {
      // If video is showing, pause it and go back to image
      if (showVideo) {
        const video = videoRef.current;
        if (video) {
          video.pause();
        }
        setIsPlaying(false);
        setShowVideo(false);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showVideo]);

  if (!title) return null;

  const formatRuntime = (seconds) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatYear = (year) => {
    if (!year) return '';
    return year.toString();
  };

  const getContentTypeIcon = (kind) => {
    return kind === 'series' ? <Tv className="w-4 h-4 text-red-400" /> : <Film className="w-4 h-4 text-red-400" />;
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'U': return 'text-green-400';
      case 'U/A 7+': return 'text-yellow-400';
      case 'U/A 13+': return 'text-orange-400';
      case 'U/A 16+': return 'text-red-400';
      case 'A': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const handlePlayNow = () => {
    // Navigate directly to watch page with fullscreen parameter
    // The VideoPlayer component will handle the fullscreen request
    navigate(`/watch/${title.id}?fullscreen=true`);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background - Video or Poster */}
      <div className="absolute inset-0">
        {showVideo && videoUrl ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
            onEnded={() => {
              setShowVideo(false);
              setIsPlaying(false);
            }}
            onError={() => {
              setShowVideo(false);
              setIsPlaying(false);
            }}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img
            src={title.hero_url || title.poster_url}
            alt={title.title}
            className="w-full h-full object-cover"
          />
        )}

        {/* Hero gradient overlay with black and red mix */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-red-900/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-end h-full pb-20 px-4 sm:px-6 lg:px-8 ml-20">
        <div className="max-w-4xl">
          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-4 mb-4"
          >
            <div className="flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-red-800/30">
              {getContentTypeIcon(title.kind)}
              <span className="text-sm font-medium text-white capitalize">
                {title.kind}
              </span>
            </div>

            {title.rating && (
              <div className={cn(
                "px-3 py-1.5 rounded-full text-sm font-bold border",
                getRatingColor(title.rating),
                "border-current bg-black/60 backdrop-blur-md"
              )}>
                {title.rating}
              </div>
            )}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight"
          >
            {title.title}
          </motion.h1>

          {/* Meta Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center space-x-6 mb-6 text-gray-300"
          >
            {title.year && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>{formatYear(title.year)}</span>
              </div>
            )}
            {title.runtime_sec && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatRuntime(title.runtime_sec)}</span>
              </div>
            )}

            {title.kind === 'series' && title.season_count && (
              <div className="flex items-center space-x-2">
                <Tv className="w-4 h-4" />
                <span>{title.season_count} Season{title.season_count !== 1 ? 's' : ''}</span>
              </div>
            )}
          </motion.div>

          {/* Synopsis */}
          {title.synopsis && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg text-gray-200 mb-8 max-w-2xl leading-relaxed"
            >
              {title.synopsis}
            </motion.p>
          )}

          {/* Genres */}
          {title.genres && title.genres.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-2 mb-8"
            >
              {title.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-red-800/30 rounded-full text-sm font-medium text-white"
                >
                  {genre}
                </span>
              ))}
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center space-x-4"
          >
            <button
              onClick={handlePlayNow}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>Play Now</span>
            </button>

            <Link
              to={`/title/${title.id}`}
              className="btn-secondary flex items-center space-x-2"
            >
              <Film className="w-5 h-5" />
              <span>More Details</span>
            </Link>

            <button className="p-3 rounded-xl bg-black/60 backdrop-blur-md text-white hover:bg-black/80 border border-red-800/30 transition-all duration-200">
              <Plus className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;