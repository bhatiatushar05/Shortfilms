import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import userService from '../services/userService'
import { useSession } from './useSession'

// React Query hooks for user features
export const useWatchlist = () => {
  const { user, isAuthed } = useSession()
  
  return useQuery({
    queryKey: ['watchlist', user?.id],
    queryFn: () => userService.getWatchlist(),
    enabled: !!isAuthed && !!user && userService.isReady(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a database schema issue or authentication issue
      if (error.message?.includes('relation') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('not authenticated') ||
          error.status === 401 ||
          error.status === 403) {
        return false
      }
      return failureCount < 2
    },
    onError: (error) => {
      console.error('Error fetching watchlist:', error)
    }
  })
}

export const useContinueWatching = () => {
  const { user } = useSession()
  
  return useQuery({
    queryKey: ['continue-watching', user?.id],
    queryFn: () => userService.getContinueWatching(),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProgress = (titleId) => {
  const { user } = useSession()
  const queryClient = useQueryClient()
  
  // Clear progress cache when title changes
  useEffect(() => {
    if (titleId) {
      userService.clearProgressCache()
    }
  }, [titleId])
  
  const { data: progress } = useQuery({
    queryKey: ['progress', user?.id, titleId],
    queryFn: () => userService.getProgress(titleId),
    enabled: !!user && !!titleId,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  const updateProgressMutation = useMutation({
    mutationFn: ({ currentTime, duration }) => {
      // Check authentication before attempting update
      if (!user || !titleId) {
        throw new Error('User not authenticated or title not available')
      }
      return userService.updateProgress(titleId, currentTime, duration)
    },
    onSuccess: () => {
      // Invalidate and refetch progress
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id, titleId] })
      queryClient.invalidateQueries({ queryKey: ['continue-watching', user?.id] })
    },
    onError: (error) => {
      // Only log errors that aren't authentication-related
      if (!error.message.includes('not authenticated') && !error.message.includes('not available')) {
        console.error('Error updating progress:', error)
      } else {
        console.log('Progress update skipped:', error.message)
      }
    }
  })

  const updateProgress = (currentTime, duration) => {
    if (user && titleId) {
      updateProgressMutation.mutate({ currentTime, duration })
    } else {
      console.log('Progress update skipped: user not authenticated or title not available', {
        hasUser: !!user,
        hasTitleId: !!titleId
      })
    }
  }

  return {
    data: progress,
    updateProgress,
    isUpdating: updateProgressMutation.isPending
  }
}

export const useViewingHistory = () => {
  const { user } = useSession()
  
  return useQuery({
    queryKey: ['viewing-history', user?.id],
    queryFn: () => userService.getViewingHistory(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUserPreferences = () => {
  const { user } = useSession()
  
  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: () => userService.getUserPreferences(),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Mutations
export const useToggleWatchlist = () => {
  const queryClient = useQueryClient()
  const { user } = useSession()
  
  return useMutation({
    mutationFn: (titleId) => userService.toggleWatchlist(titleId),
    onSuccess: (data, titleId) => {
      // Invalidate and refetch watchlist
      queryClient.invalidateQueries({ queryKey: ['watchlist', user?.id] })
      
      // Update individual title watchlist status
      queryClient.setQueryData(['watchlist-status', titleId], data.inList)
      
      // Invalidate continue watching if removing from watchlist
      if (!data.inList) {
        queryClient.invalidateQueries({ queryKey: ['continue-watching', user?.id] })
      }
    },
    onError: (error) => {
      console.error('Error toggling watchlist:', error)
    }
  })
}

export const useUpdateProgress = () => {
  const queryClient = useQueryClient()
  const { user } = useSession()
  
  return useMutation({
    mutationFn: ({ titleId, positionSec, durationSec }) => 
      userService.updateProgress(titleId, positionSec, durationSec),
    onSuccess: (data, { titleId }) => {
      // Invalidate and refetch progress for this title
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id, titleId] })
      
      // Invalidate continue watching
      queryClient.invalidateQueries({ queryKey: ['continue-watching', user?.id] })
      
      // Invalidate viewing history
      queryClient.invalidateQueries({ queryKey: ['viewing-history', user?.id] })
    },
    onError: (error) => {
      console.error('Error updating progress:', error)
    }
  })
}

export const useClearProgress = () => {
  const queryClient = useQueryClient()
  const { user } = useSession()
  
  return useMutation({
    mutationFn: (titleId) => userService.clearProgress(titleId),
    onSuccess: (data, titleId) => {
      // Invalidate and refetch progress for this title
      queryClient.invalidateQueries({ queryKey: ['progress', user?.id, titleId] })
      
      // Invalidate continue watching
      queryClient.invalidateQueries({ queryKey: ['continue-watching', user?.id] })
      
      // Invalidate viewing history
      queryClient.invalidateQueries({ queryKey: ['viewing-history', user?.id] })
    },
    onError: (error) => {
      console.error('Error clearing progress:', error)
    }
  })
}

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient()
  const { user } = useSession()
  
  return useMutation({
    mutationFn: (preferences) => userService.updateUserPreferences(preferences),
    onSuccess: (data, preferences) => {
      // Update user preferences in cache
      queryClient.setQueryData(['user-preferences', user?.id], preferences)
      
      // Invalidate user preferences query
      queryClient.invalidateQueries({ queryKey: ['user-preferences', user?.id] })
    },
    onError: (error) => {
      console.error('Error updating user preferences:', error)
    }
  })
}

// Utility hooks
export const useWatchlistStatus = (titleId) => {
  const { user, isAuthed } = useSession()
  
  return useQuery({
    queryKey: ['watchlist-status', titleId],
    queryFn: () => userService.isInWatchlist(titleId),
    enabled: !!isAuthed && !!user && !!titleId && userService.isReady(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a database schema issue or authentication issue
      if (error.message?.includes('relation') || 
          error.message?.includes('does not exist') ||
          error.message?.includes('not authenticated') ||
          error.status === 401 ||
          error.status === 403) {
        return false
      }
      return failureCount < 2
    },
    onError: (error) => {
      console.error('Error fetching watchlist status:', error)
    }
  })
}

export const useUserStats = () => {
  const { user } = useSession()
  
  return useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      const [watchlist, continueWatching, viewingHistory] = await Promise.all([
        userService.getWatchlist(),
        userService.getContinueWatching(),
        userService.getViewingHistory()
      ])
      
      return {
        watchlistCount: watchlist.length,
        continueWatchingCount: continueWatching.length,
        viewingHistoryCount: viewingHistory.length,
        totalWatchTime: viewingHistory.reduce((total, item) => {
          return total + (item.positionSec || 0)
        }, 0)
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Combined hooks for common use cases
export const useUserContent = () => {
  const { user } = useSession()
  
  return useQuery({
    queryKey: ['user-content', user?.id],
    queryFn: async () => {
      try {
        const [watchlist, continueWatching] = await Promise.all([
          userService.getWatchlist(),
          userService.getContinueWatching()
        ])
        
        return {
          watchlist,
          continueWatching
        }
      } catch (error) {
        // If it's a database connection error, return empty content
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('Database tables not set up yet. Please run the schema setup first.')
          return { watchlist: [], continueWatching: [] }
        }
        throw error
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a database schema issue
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Hook for checking if user has any content
export const useHasUserContent = () => {
  const { user } = useSession()
  const { data: userContent } = useUserContent()
  
  return {
    hasWatchlist: userContent?.watchlist?.length > 0,
    hasContinueWatching: userContent?.continueWatching?.length > 0,
    hasAnyContent: (userContent?.watchlist?.length || 0) + (userContent?.continueWatching?.length || 0) > 0
  }
}
