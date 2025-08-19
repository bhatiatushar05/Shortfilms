/**
 * Content item type definitions
 */

export const CONTENT_TYPES = {
  MOVIE: 'movie',
  SERIES: 'series',
}

export const CONTENT_RATINGS = {
  U: 'U',
  UA7: 'U/A 7+',
  UA13: 'U/A 13+',
  UA16: 'U/A 16+',
  A: 'A',
}

export const SORT_OPTIONS = {
  NEW: 'new',
  TRENDING: 'trending',
  TOP: 'top',
}

/**
 * @typedef {Object} Subtitle
 * @property {string} lang - Language code (e.g., 'en', 'es')
 * @property {string} url - WebVTT file URL
 * @property {string} [label] - Optional display label
 */

/**
 * @typedef {Object} TitleSummary
 * @property {string} id - Unique identifier
 * @property {string} kind - Content type ('movie' or 'series')
 * @property {string} slug - URL-safe slug
 * @property {string} title - Content title
 * @property {number} year - Release year
 * @property {string[]} genres - Content genres
 * @property {string} posterUrl - Poster image URL
 * @property {string} [rating] - Content rating
 * @property {number} [runtimeSec] - Runtime in seconds (movies only)
 * @property {number} [seasonCount] - Number of seasons (series only)
 */

/**
 * @typedef {Object} Title
 * @property {string} id - Unique identifier
 * @property {string} kind - Content type ('movie' or 'series')
 * @property {string} slug - URL-safe slug
 * @property {string} title - Content title
 * @property {string} synopsis - Content description
 * @property {number} year - Release year
 * @property {string} rating - Content rating
 * @property {number} [runtimeSec] - Runtime in seconds (movies only)
 * @property {string[]} genres - Content genres
 * @property {string[]} tags - Content tags
 * @property {string} posterUrl - Poster image URL (2:3 aspect ratio, min 600x900)
 * @property {string} heroUrl - Hero image URL (16:9 aspect ratio, min 1920x1080)
 * @property {string} [trailerUrl] - Optional trailer URL
 * @property {string} [playbackUrl] - HLS master.m3u8 URL (movies only)
 * @property {Subtitle[]} subtitles - Array of subtitle objects
 * @property {string} createdAt - ISO string timestamp
 * @property {Season[]} [seasons] - Seasons array (series only)
 */

/**
 * @typedef {Object} Season
 * @property {string} id - Unique identifier
 * @property {string} titleId - Reference to parent title
 * @property {number} seasonNumber - Season number
 * @property {string} [overview] - Optional season overview
 * @property {Episode[]} episodes - Array of episodes
 */

/**
 * @typedef {Object} Episode
 * @property {string} id - Unique identifier
 * @property {string} titleId - Reference to parent title
 * @property {number} seasonNumber - Season number
 * @property {number} episodeNumber - Episode number within season
 * @property {string} title - Episode title
 * @property {string} synopsis - Episode description
 * @property {number} runtimeSec - Episode runtime in seconds
 * @property {string} playbackUrl - HLS master.m3u8 URL
 * @property {Subtitle[]} subtitles - Array of subtitle objects
 */

/**
 * @typedef {Object} Person
 * @property {string} id - Unique identifier
 * @property {string} name - Person's name
 * @property {string[]} roles - Array of roles
 * @property {string} [photoUrl] - Optional photo URL
 */

/**
 * @typedef {Object} Credit
 * @property {string} titleId - Reference to title
 * @property {string} personId - Reference to person
 * @property {string} job - Job type ('cast' or 'crew')
 */

/**
 * @typedef {Object} CatalogResponse
 * @property {TitleSummary[]} items - Array of title summaries
 * @property {number} page - Current page number
 * @property {number} pageSize - Items per page
 * @property {number} total - Total number of items
 * @property {boolean} hasMore - Whether there are more pages
 */

/**
 * @typedef {Object} RowResponse
 * @property {string} key - Row identifier
 * @property {string} name - Display name
 * @property {TitleSummary[]} items - Array of title summaries
 */

/**
 * @typedef {Object} WatchlistToggleResponse
 * @property {boolean} ok - Success status
 * @property {boolean} inList - Whether title is now in watchlist
 */

/**
 * @typedef {Object} ProgressResponse
 * @property {boolean} ok - Success status
 */

/**
 * @typedef {Object} CheckoutSessionResponse
 * @property {string} url - Checkout session URL
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - Error message
 * @property {string} code - Error code
 * @property {any} [details] - Optional error details
 */

// Validation functions
export const validateTitle = (title) => {
  const errors = []

  // Required fields
  if (!title.id) errors.push('id is required')
  if (!title.kind) errors.push('kind is required')
  if (!title.title) errors.push('title is required')
  if (!title.posterUrl) errors.push('posterUrl is required')

  // Validate kind values
  if (title.kind && !Object.values(CONTENT_TYPES).includes(title.kind)) {
    errors.push('kind must be "movie" or "series"')
  }

  // Conditional validation for movies
  if (title.kind === 'movie') {
    if (!title.runtimeSec) errors.push('runtimeSec is required for movies')
    if (!title.playbackUrl) errors.push('playbackUrl is required for movies')
  }

  // Validate ID format (no spaces)
  if (title.id && title.id.includes(' ')) {
    errors.push('id cannot contain spaces')
  }

  // Validate slug format (lowercase, hyphenated, ASCII only)
  if (title.slug && !/^[a-z0-9-]+$/.test(title.slug)) {
    errors.push('slug must be lowercase, hyphenated, ASCII only')
  }

  return errors
}

export const validateTitleSummary = (summary) => {
  const errors = []

  // Required fields for summary
  if (!summary.id) errors.push('id is required')
  if (!summary.kind) errors.push('kind is required')
  if (!summary.slug) errors.push('slug is required')
  if (!summary.title) errors.push('title is required')
  if (!summary.posterUrl) errors.push('posterUrl is required')

  // Validate kind values
  if (summary.kind && !Object.values(CONTENT_TYPES).includes(summary.kind)) {
    errors.push('kind must be "movie" or "series"')
  }

  return errors
}
