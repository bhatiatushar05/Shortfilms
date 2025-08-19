import React, { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  SkipBack, SkipForward, Settings, Fullscreen, RotateCcw
} from 'lucide-react'
import { cn } from '../../utils/cn'

const VideoPlayer = ({ 
  src, 
  poster, 
  title, 
  onProgress, 
  onEnded, 
  className = '',
  autoPlay = false,
  autoFullscreen = false 
}) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const containerRef = useRef(null)
  const progressRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showProgressTooltip, setShowProgressTooltip] = useState(false)
  const [tooltipTime, setTooltipTime] = useState(0)
  const [tooltipPosition, setTooltipPosition] = useState(0)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)

  // Check if fullscreen is supported and allowed
  const checkFullscreenSupport = useCallback(() => {
    if (!document.fullscreenEnabled && 
        !document.webkitFullscreenEnabled && 
        !document.mozFullScreenEnabled && 
        !document.msFullscreenEnabled) {
      return false
    }
    return true
  }, [])

  // Request fullscreen with proper permission handling
  const requestFullscreen = useCallback(async (element) => {
    if (!checkFullscreenSupport()) {
      console.log('Fullscreen not supported in this browser')
      return false
    }

    // Check if we have permission to request fullscreen
    if (document.fullscreenElement) {
      console.log('Already in fullscreen mode')
      return true
    }

    try {
      const requestFullscreen = element.requestFullscreen || 
                               element.webkitRequestFullscreen || 
                               element.mozRequestFullScreen || 
                               element.msRequestFullscreen;
      
      if (requestFullscreen) {
        await requestFullscreen.call(element)
        setIsFullscreen(true)
        return true
      }
    } catch (error) {
      console.log('Fullscreen request failed:', error)
      return false
    }
    return false
  }, [checkFullscreenSupport])

  // Handle auto-fullscreen after user interaction
  const handleAutoFullscreen = useCallback(() => {
    if (autoFullscreen && hasUserInteracted && !document.fullscreenElement) {
      console.log('Attempting auto-fullscreen after user interaction...')
      setTimeout(() => {
        if (videoRef.current) {
          requestFullscreen(videoRef.current).then((success) => {
            if (success) {
              console.log('Auto-fullscreen successful after user interaction')
            } else {
              console.log('Auto-fullscreen failed after user interaction')
            }
          })
        }
      }, 1000) // Small delay to ensure video is ready
    }
  }, [autoFullscreen, hasUserInteracted, requestFullscreen])

  // Initialize HLS
  useEffect(() => {
    if (!src || !videoRef.current) return

    const initHLS = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Check if the URL is an HLS stream (.m3u8) or MP4
        const isHLS = src.includes('.m3u8') || src.includes('application/vnd.apple.mpegurl')
        const isMP4 = src.includes('.mp4') || src.includes('video/mp4')

        // If it's MP4, use direct video playback
        if (isMP4 || (!isHLS && !src.includes('.m3u8'))) {
          console.log('Using direct MP4 playback for:', src)
          videoRef.current.src = src
          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsLoading(false)
            if (autoPlay) {
              // Try autoplay but handle failure gracefully
              videoRef.current.play().catch(e => {
                if (e.name === 'NotAllowedError') {
                  console.log('Autoplay blocked by browser - user interaction required')
                  // Don't log this as an error since it's expected behavior
                } else {
                  console.log('Auto-play failed:', e)
                }
              })
              // Auto-fullscreen after successful play - only if user has interacted
              if (autoFullscreen && hasUserInteracted) {
                const attemptFullscreen = (retryCount = 0) => {
                  setTimeout(() => {
                    if (videoRef.current && !document.fullscreenElement && hasUserInteracted) {
                      requestFullscreen(videoRef.current).catch(e => {
                        console.log('Auto-fullscreen failed:', e)
                        // Retry up to 2 times with increasing delays
                        if (retryCount < 2) {
                          attemptFullscreen(retryCount + 1)
                        }
                      })
                    } else if (retryCount < 2) {
                      // Video not ready yet, retry
                      attemptFullscreen(retryCount + 1)
                    }
                  }, 1500 + (retryCount * 1000)) // Base delay + retry delay
                }
                
                attemptFullscreen()
              }
            }
          })
          videoRef.current.addEventListener('error', (e) => {
            console.error('Video error:', e)
            setError('Failed to load video file')
            setIsLoading(false)
          })
          return
        }

        // Check if HLS is supported natively (Safari)
        if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
          console.log('Using native HLS playback for:', src)
          videoRef.current.src = src
          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsLoading(false)
            if (autoPlay) {
              // Try autoplay but handle failure gracefully
              videoRef.current.play().catch(e => {
                if (e.name === 'NotAllowedError') {
                  console.log('Autoplay blocked by browser - user interaction required')
                  // Don't log this as an error since it's expected behavior
                } else {
                  console.log('Auto-play failed:', e)
                }
              })
              // Auto-fullscreen after successful play - only if user has interacted
              if (autoFullscreen && hasUserInteracted) {
                const attemptFullscreen = (retryCount = 0) => {
                  setTimeout(() => {
                    if (videoRef.current && !document.fullscreenElement && hasUserInteracted) {
                      requestFullscreen(videoRef.current).catch(e => {
                        console.log('Auto-fullscreen failed:', e)
                        // Retry up to 2 times with increasing delays
                        if (retryCount < 2) {
                          attemptFullscreen(retryCount + 1)
                        }
                      })
                    } else if (retryCount < 2) {
                      // Video not ready yet, retry
                      attemptFullscreen(retryCount + 1)
                    }
                  }, 1500 + (retryCount * 1000)) // Base delay + retry delay
                }
                
                attemptFullscreen()
              }
            }
          })
          return
        }

        // Use HLS.js for other browsers
        if (window.Hls && window.Hls.isSupported()) {
          console.log('Using HLS.js for:', src)
          hlsRef.current = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          })
          
          hlsRef.current.loadSource(src)
          hlsRef.current.attachMedia(videoRef.current)
          
          hlsRef.current.on(window.Hls.Events.MANIFEST_PARSED, () => {
            setIsLoading(false)
            if (autoPlay) {
              // Try autoplay but handle failure gracefully
              videoRef.current.play().catch(e => {
                if (e.name === 'NotAllowedError') {
                  console.log('Autoplay blocked by browser - user interaction required')
                  // Don't log this as an error since it's expected behavior
                } else {
                  console.log('Auto-play failed:', e)
                }
              })
              // Auto-fullscreen after successful play - only if user has interacted
              if (autoFullscreen && hasUserInteracted) {
                const attemptFullscreen = (retryCount = 0) => {
                  setTimeout(() => {
                    if (videoRef.current && !document.fullscreenElement && hasUserInteracted) {
                      requestFullscreen(videoRef.current).catch(e => {
                        console.log('Auto-fullscreen failed:', e)
                        // Retry up to 2 times with increasing delays
                        if (retryCount < 2) {
                          attemptFullscreen(retryCount + 1)
                        }
                      })
                    } else if (retryCount < 2) {
                      // Video not ready yet, retry
                      attemptFullscreen(retryCount + 1)
                    }
                  }, 1500 + (retryCount * 1000)) // Base delay + retry delay
                }
                
                attemptFullscreen()
              }
            }
          })
          
          hlsRef.current.on(window.Hls.Events.ERROR, (event, data) => {
            console.error('HLS Error:', data)
            // Try fallback to direct video playback
            console.log('HLS failed, trying direct video playback...')
            videoRef.current.src = src
            setIsLoading(false)
          })
        } else {
          // HLS not supported, try direct video playback as fallback
          console.log('HLS not supported, trying direct video playback for:', src)
          videoRef.current.src = src
          videoRef.current.addEventListener('loadedmetadata', () => {
            setIsLoading(false)
            if (autoPlay) {
              // Try autoplay but handle failure gracefully
              videoRef.current.play().catch(e => {
                if (e.name === 'NotAllowedError') {
                  console.log('Autoplay blocked by browser - user interaction required')
                  // Don't log this as an error since it's expected behavior
                } else {
                  console.log('Auto-play failed:', e)
                }
              })
            }
          })
          videoRef.current.addEventListener('error', (e) => {
            console.error('Direct video playback failed:', e)
            setError('Video format not supported. Please try MP4 format.')
            setIsLoading(false)
          })
        }
      } catch (err) {
        console.error('Error initializing video player:', err)
        setError('Failed to initialize video player')
        setIsLoading(false)
      }
    }

    initHLS()

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, autoPlay, hasUserInteracted, requestFullscreen])

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      // Only call onProgress if it's provided (this prevents unnecessary calls when not authenticated)
      if (onProgress && typeof onProgress === 'function') {
        onProgress(video.currentTime, video.duration)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      // Only call onEnded if it's provided (this prevents unnecessary calls when not authenticated)
      if (onEnded && typeof onEnded === 'function') {
        onEnded()
      }
    }

    // Fullscreen change handler
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement || 
                             !!document.webkitFullscreenElement || 
                             !!document.mozFullScreenElement || 
                             !!document.msFullscreenElement
      
      setIsFullscreen(isFullscreenNow)
      
      // If entering fullscreen and video is paused, start playing
      if (isFullscreenNow && !isPlaying && video.paused) {
        video.play().catch(e => console.log('Auto-play on fullscreen failed:', e))
      }
      
      // If exiting fullscreen, ensure video is still visible and playing
      if (!isFullscreenNow && isPlaying && video.paused) {
        video.play().catch(e => console.log('Resume play after fullscreen exit failed:', e))
      }
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    
    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      
      // Remove fullscreen change listeners
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [onProgress, onEnded, isPlaying])

  // Controls visibility and keyboard shortcuts
  useEffect(() => {
    let timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', () => setShowControls(false))
      container.focus() // Make container focusable for keyboard events
    }

    return () => {
      clearTimeout(timeout)
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', () => setShowControls(false))
      }
    }
  }, [])

  // Keyboard shortcuts (separate effect to avoid dependency issues)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!videoRef.current) return
      
      switch (e.key) {
        case ' ':
          e.preventDefault()
          if (videoRef.current) {
            if (isPlaying) {
              videoRef.current.pause()
            } else {
              videoRef.current.play()
            }
          }
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime - 10, duration))
          }
          break
        case 'ArrowRight':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + 10, duration))
          }
          break
        case 'ArrowUp':
          e.preventDefault()
          const newVolume = Math.min(1, volume + 0.1)
          setVolume(newVolume)
          if (videoRef.current) {
            videoRef.current.volume = newVolume
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          const lowerVolume = Math.max(0, volume - 0.1)
          setVolume(lowerVolume)
          if (videoRef.current) {
            videoRef.current.volume = lowerVolume
          }
          break
        case 'm':
        case 'M':
          e.preventDefault()
          if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
          }
          break
        case 'f':
        case 'F':
          e.preventDefault()
          if (!document.fullscreenElement) {
            if (videoRef.current) {
              const requestFullscreen = videoRef.current.requestFullscreen || 
                                     videoRef.current.webkitRequestFullscreen || 
                                     videoRef.current.mozRequestFullScreen || 
                                     videoRef.current.msRequestFullscreen;
              
              if (requestFullscreen) {
                requestFullscreen.call(videoRef.current).then(() => {
                  setIsFullscreen(true)
                }).catch(e => console.log('Keyboard fullscreen failed:', e))
              }
            }
          } else {
            document.exitFullscreen()
            setIsFullscreen(false)
          }
          break
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen()
            setIsFullscreen(false)
          }
          break
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [volume, isFullscreen, isPlaying, isMuted, duration])

  // Playback controls
  const togglePlay = useCallback(() => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
    
    // Try auto-fullscreen after play interaction
    handleAutoFullscreen()
  }, [isPlaying, handleAutoFullscreen])

  const toggleMute = useCallback(() => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }, [isMuted])

  const handleVolumeChange = useCallback((e) => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }, [])

  const skipTime = useCallback((seconds) => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration))
    }
  }, [duration])

  const seekTo = useCallback((time) => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  const toggleFullscreen = useCallback(() => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    if (!document.fullscreenElement) {
      if (videoRef.current) {
        requestFullscreen(videoRef.current).then((success) => {
          if (success) {
            setIsFullscreen(true)
          }
        }).catch(e => console.log('Toggle fullscreen failed:', e))
      }
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
    
    // Try auto-fullscreen after fullscreen interaction
    handleAutoFullscreen()
  }, [requestFullscreen, handleAutoFullscreen])

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = useCallback((e) => {
    // Mark that user has interacted
    setHasUserInteracted(true)
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    const newTime = percentage * duration
    seekTo(newTime)
  }, [duration, seekTo])

  const handleProgressHover = useCallback((e) => {
    const rect = progressRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percentage = hoverX / rect.width
    const hoverTime = percentage * duration
    
    setTooltipTime(hoverTime)
    setTooltipPosition(hoverX)
    setShowProgressTooltip(true)
  }, [duration])

  const handleProgressLeave = useCallback(() => {
    setShowProgressTooltip(false)
  }, [])

  if (error) {
    return (
      <div className={cn("relative bg-dark-900 rounded-xl overflow-hidden", className)}>
        <div className="flex items-center justify-center h-64 text-red-400">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Error Loading Video</p>
            <p className="text-sm text-dark-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      tabIndex={0}
      className={cn(
        "relative bg-black rounded-xl overflow-hidden group outline-none",
        isFullscreen && "fixed inset-0 z-50",
        className
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        className={cn(
          "w-full h-full object-contain",
          isFullscreen && "object-cover"
        )}
        playsInline
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center"
          >
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Loading video...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
          >
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
              <h2 className="text-white font-semibold text-lg truncate max-w-md">
                {title}
              </h2>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 group-hover:scale-110"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" />
                  )}
                </button>
                
                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="px-4 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-all duration-200 flex items-center space-x-2"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize className="w-4 h-4" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize className="w-4 h-4" />
                      <span>Fullscreen</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
              {/* Progress Bar */}
              <div className="mb-4">
                <div
                  ref={progressRef}
                  className="relative h-2 bg-white/20 rounded-full cursor-pointer group/progress"
                  onClick={handleProgressClick}
                  onMouseMove={handleProgressHover}
                  onMouseLeave={handleProgressLeave}
                >
                  <div 
                    className="h-full bg-primary-500 rounded-full transition-all duration-100"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  
                  {/* Progress Tooltip */}
                  {showProgressTooltip && (
                    <div
                      className="absolute top-0 transform -translate-y-full -translate-x-1/2 bg-dark-800 text-white px-2 py-1 rounded text-sm whitespace-nowrap"
                      style={{ left: tooltipPosition }}
                    >
                      {formatTime(tooltipTime)}
                    </div>
                  )}
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Skip Back */}
                  <button
                    onClick={() => skipTime(-10)}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  {/* Skip Forward */}
                  <button
                    onClick={() => skipTime(10)}
                    className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Volume Control */}
                  <div className="relative">
                    <button
                      onClick={toggleMute}
                      onMouseEnter={() => setShowVolumeSlider(true)}
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    
                    {showVolumeSlider && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-dark-800 rounded-lg">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20 h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer slider"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Display */}
                <div className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click to Show Controls */}
      {!showControls && (
        <div 
          className="absolute inset-0 cursor-pointer"
          onClick={() => setShowControls(true)}
        />
      )}
    </div>
  )
}

export default VideoPlayer
