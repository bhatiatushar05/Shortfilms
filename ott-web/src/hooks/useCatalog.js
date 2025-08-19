import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import catalogService from '../services/catalogService'
import rowsService from '../services/rowsService'

// React Query hooks for catalog operations
export const useCatalog = (params = {}) => {
  return useQuery({
    queryKey: ['catalog', params],
    queryFn: () => catalogService.getCatalog(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useInfiniteCatalog = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['catalog-infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      catalogService.getCatalog({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined
      return lastPage.page + 1
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useTitle = (id) => {
  return useQuery({
    queryKey: ['title', id],
    queryFn: () => catalogService.getTitle(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useRows = (keys = []) => {
  return useQuery({
    queryKey: ['rows', keys],
    queryFn: () => rowsService.getRows(keys),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const usePopularRow = () => {
  return useQuery({
    queryKey: ['row', 'popular'],
    queryFn: () => rowsService.getPopularRow(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useTrendingRow = () => {
  return useQuery({
    queryKey: ['row', 'trending'],
    queryFn: () => rowsService.getTrendingRow(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useNewRow = () => {
  return useQuery({
    queryKey: ['row', 'new'],
    queryFn: () => rowsService.getNewRow(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useGenreRow = (genre) => {
  return useQuery({
    queryKey: ['row', 'genre', genre],
    queryFn: () => rowsService.getGenreRow(genre),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useAvailableGenres = () => {
  return useQuery({
    queryKey: ['genres'],
    queryFn: () => rowsService.getAvailableGenres(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

export const useCustomRow = (query, options = {}) => {
  return useQuery({
    queryKey: ['custom-row', query, options],
    queryFn: () => rowsService.getCustomRow(query, options),
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Search hook with debouncing
export const useSearch = (query, filters = {}) => {
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => catalogService.getCatalog({ q: query, ...filters }),
    enabled: !!query, // Enable for any query, including 'all'
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Filtered catalog hook
export const useFilteredCatalog = (filters = {}) => {
  return useQuery({
    queryKey: ['filtered-catalog', filters],
    queryFn: () => catalogService.getCatalog(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Home page rows hook
export const useHomeRows = () => {
  return useQuery({
    queryKey: ['home-rows'],
    queryFn: async () => {
      try {
        return await rowsService.getRows(['popular', 'trending', 'new'])
      } catch (error) {
        // If it's a database connection error, return empty rows
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          console.warn('Database tables not set up yet. Please run the schema setup first.')
          return []
        }
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's a database schema issue
      if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return false
      }
      return failureCount < 3
    }
  })
}

// Movie catalog hook
export const useMovieCatalog = (params = {}) => {
  return useQuery({
    queryKey: ['movie-catalog', params],
    queryFn: () => catalogService.getCatalog({ ...params, kind: 'movie' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Series catalog hook
export const useSeriesCatalog = (params = {}) => {
  return useQuery({
    queryKey: ['series-catalog', params],
    queryFn: () => catalogService.getCatalog({ ...params, kind: 'series' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Year-based catalog hook
export const useYearCatalog = (year, params = {}) => {
  return useQuery({
    queryKey: ['year-catalog', year, params],
    queryFn: () => catalogService.getCatalog({ ...params, year }),
    enabled: !!year,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Genre-based catalog hook
export const useGenreCatalog = (genre, params = {}) => {
  return useQuery({
    queryKey: ['genre-catalog', genre, params],
    queryFn: () => catalogService.getCatalog({ ...params, genre }),
    enabled: !!genre,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}
