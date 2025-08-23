import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../../lib/supabase'
import HeroSection from '../../../components/media/HeroSection'
import ContentRow from '../../../components/media/ContentRow'
import { SkeletonRow, SkeletonHero } from '../../../components/ui/Skeleton'

const Home = () => {
  // Fetch all titles directly from the database
  const { data: titles, isLoading, error } = useQuery({
    queryKey: ['home-titles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('titles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black relative z-10">
        <div className="w-full">
          {/* Enhanced cinematic hero skeleton */}
          <SkeletonHero />
          <div className="space-y-8 px-4 sm:px-6 lg:px-8 py-8 ml-20">
            <SkeletonRow title={true} cards={6} />
            <SkeletonRow title={true} cards={6} />
            <SkeletonRow title={true} cards={6} />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center relative z-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Content</h2>
          <p className="text-red-400 mb-6">Error: {error.message}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!titles || titles.length === 0) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center relative z-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Content Available</h2>
          <p className="text-red-300 mb-6">Check back later for new content.</p>
        </div>
      </div>
    )
  }

  // Use featured title as hero content, fallback to first title if none featured
  const heroContent = titles.find(title => title.is_featured) || titles[0]
  
  // Debug logging
  console.log('Fetched titles:', titles)
  console.log('Hero content:', heroContent)
  console.log('Featured titles:', titles.filter(title => title.is_featured))
  
  // Create content rows from the remaining titles
  const contentRows = [
    {
      id: 'popular',
      title: 'Popular',
      items: titles.slice(0, 6)
    },
    {
      id: 'trending', 
      title: 'Trending',
      items: titles.slice(6, 12)
    },
    {
      id: 'new',
      title: 'New Releases',
      items: titles.slice(12, 18)
    }
  ]

  return (
    <div className="min-h-screen w-full bg-black relative z-10">
      {/* Hero Section - Always Show First with Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full"
      >
        <HeroSection title={heroContent} />
      </motion.div>

      {/* Content Rows - Multiple Rows Below Hero */}
      {contentRows.length > 0 && (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8 ml-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-8"
          >
            {contentRows.map((row, index) => (
              <motion.div
                key={row.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <ContentRow
                  title={row.title}
                  items={row.items || []}
                  showWatchlist={true}
                  showPlayButton={true}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Home
