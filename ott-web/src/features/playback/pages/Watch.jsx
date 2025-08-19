import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Play, Film, Tv, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { useTitle } from '../../../hooks/useCatalog'
import { cn } from '../../../utils/cn'
import VideoPlayer from '../../../components/media/VideoPlayer'
import { useSession } from '../../../hooks/useSession'
import { useProgress } from '../../../hooks/useUserFeatures'
import { useEffect } from 'react'

const Watch = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const { data: title, isLoading, error } = useTitle(id)
  const { isAuthed } = useSession()
  // Only use progress hook when user is authenticated and title is loaded
  const { data: progress, updateProgress } = useProgress(
    isAuthed && title?.id ? title.id : null
  )

  // Check if fullscreen parameter is present
  const shouldAutoFullscreen = searchParams.get('fullscreen') === 'true'

  // Check if this is a movie with video content
  const hasVideo = title?.kind === 'movie' && (title?.playback_url || title?.playbackUrl)

  // Auto-fullscreen effect - only attempt after user interaction
  useEffect(() => {
    if (shouldAutoFullscreen && hasVideo) {
      console.log('Auto-fullscreen requested for video:', title?.title)
      console.log('Note: Fullscreen will be attempted after user interaction with the video player')
      
      // Don't attempt auto-fullscreen immediately - wait for user interaction
      // The VideoPlayer component will handle this after user interaction
    }
  }, [shouldAutoFullscreen, hasVideo, title?.title]);

  const formatRuntime = (seconds) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const getContentTypeIcon = (kind) => {
    return kind === 'series' ? <Tv className="w-4 h-4 text-primary-400" /> : <Film className="w-4 h-4 text-primary-400" />
  }

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'U': return 'text-green-400'
      case 'U/A 7+': return 'text-yellow-400'
      case 'U/A 13+': return 'text-orange-400'
      case 'U/A 16+': return 'text-red-400'
      case 'A': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 text-white p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 bg-dark-700 rounded" />
          <div className="h-6 w-1/2 bg-dark-700 rounded" />
          <div className="h-[50vh] w-full bg-dark-800 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Content</h2>
          <p className="text-red-400 mb-6">{error.message}</p>
          <Link to={-1} className="btn-primary">Go Back</Link>
        </div>
      </div>
    )
  }

  if (!title) {
    return (
      <div className="min-h-screen bg-dark-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Content Not Found</h2>
          <p className="text-gray-400 mb-6">The requested content could not be found.</p>
          <Link to={-1} className="btn-primary">Go Back</Link>
        </div>
      </div>
    )
  }

  // Handle both snake_case and camelCase fields gracefully
  const posterUrl = title.poster_url || title.posterUrl
  const heroUrl = title.hero_url || title.heroUrl || posterUrl
  const runtimeSeconds = title.runtime_sec || title.runtimeSec
  const seasonCount = title.season_count || title.seasonCount
  const playbackUrl = title.playback_url || title.playbackUrl

  // Handle progress updates
  const handleProgress = (currentTime, duration) => {
    if (isAuthed && updateProgress) {
      updateProgress(currentTime, duration)
    }
  }

  // Handle video ended
  const handleVideoEnded = () => {
    if (isAuthed && updateProgress) {
      updateProgress(0, 0) // Reset progress when video ends
    }
  }

  // Handle video click for fullscreen fallback
  const handleVideoClick = () => {
    if (shouldAutoFullscreen) {
      console.log('Video clicked - fullscreen will be handled by VideoPlayer component')
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          to={`/title/${title.id}`}
          className="flex items-center space-x-2 px-3 py-2 bg-black/50 backdrop-blur-sm text-white rounded-lg hover:bg-black/70 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </Link>
      </div>

      {/* Video Player Section */}
      {hasVideo ? (
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Video Player */}
            <div className="mb-8">
              <VideoPlayer
                src={playbackUrl}
                poster={posterUrl}
                title={title.title}
                onProgress={handleProgress}
                onEnded={handleVideoEnded}
                className="w-full aspect-video"
                autoPlay={true}
                autoFullscreen={shouldAutoFullscreen}
                onClick={handleVideoClick}
              />
            </div>

            {/* Video Info */}
            <div className="bg-dark-800 rounded-xl p-6 border border-dark-600/30">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-2 bg-dark-700 px-3 py-1.5 rounded-full border border-dark-600/30">
                  {getContentTypeIcon(title.kind)}
                  <span className="text-sm font-medium capitalize">{title.kind}</span>
                </div>
                {title.rating && (
                  <div className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-bold border bg-dark-700',
                    getRatingColor(title.rating)
                  )}>
                    {title.rating}
                  </div>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{title.title}</h1>

              <div className="flex items-center space-x-6 text-dark-300 mb-6">
                {title.year && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>{title.year}</span>
                  </div>
                )}
                {runtimeSeconds && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>{formatRuntime(runtimeSeconds)}</span>
                  </div>
                )}
              </div>

              {title.synopsis && (
                <p className="text-lg text-dark-200 leading-relaxed">{title.synopsis}</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback for content without video */
        <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden">
          <img src={heroUrl} alt={title.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/60 to-transparent" />

          <div className="relative z-10 h-full flex items-end pb-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="flex items-center space-x-2 bg-dark-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-dark-600/30">
                {getContentTypeIcon(title.kind)}
                <span className="text-sm font-medium capitalize">{title.kind}</span>
              </div>
              {title.rating && (
                <div className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-bold border bg-dark-900/80 backdrop-blur-sm',
                  getRatingColor(title.rating)
                )}>
                  {title.rating}
                </div>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold mb-3">{title.title}</h1>

            <div className="flex items-center space-x-6 text-dark-300 mb-6">
              {title.year && (
                <div className="flex items-center space-x-2"><Calendar className="w-5 h-5" /><span>{title.year}</span></div>
              )}
              {runtimeSeconds && (
                <div className="flex items-center space-x-2"><Clock className="w-5 h-5" /><span>{formatRuntime(runtimeSeconds)}</span></div>
              )}
              {title.kind === 'series' && seasonCount && (
                <div className="flex items-center space-x-2"><Tv className="w-5 h-5" /><span>{seasonCount} Season{seasonCount !== 1 ? 's' : ''}</span></div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button className="btn-primary flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Play</span>
              </button>
              <Link to={`/title/${title.id}`} className="btn-secondary flex items-center space-x-2">
                <Film className="w-5 h-5" />
                <span>Details</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Description and meta for non-video content */}
      {!hasVideo && (
        <div className="px-4 sm:px-6 lg:px-8 py-10">
          {title.synopsis && (
            <p className="text-lg text-dark-200 max-w-3xl mb-8 leading-relaxed">{title.synopsis}</p>
          )}

          {/* Poster preview for context on smaller screens */}
          {!heroUrl && posterUrl && (
            <img src={posterUrl} alt={`${title.title} poster`} className="w-48 rounded-lg border border-dark-700" />
          )}
        </div>
      )}
    </div>
  )
}

export default Watch
