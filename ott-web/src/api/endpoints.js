// API endpoints configuration
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },

  // Content Catalog
  CATALOG: {
    LIST: '/catalog',
    TITLE: (id) => `/title/${id}`,
    ROWS: '/rows',
  },

  // User Features
  USER: {
    WATCHLIST: {
      GET: '/user/watchlist',
      TOGGLE: '/user/watchlist',
    },
    CONTINUE: '/user/continue',
    PROGRESS: '/progress',
    PREFERENCES: '/user/preferences',
    HISTORY: '/user/history',
  },

  // Playback
  PLAYBACK: {
    STREAM: (id) => `/playback/stream/${id}`,
    PROGRESS: (id) => `/playback/progress/${id}`,
    SUBTITLES: (id) => `/playback/subtitles/${id}`,
  },

  // Billing
  BILLING: {
    PLANS: '/billing/plans',
    SUBSCRIPTION: '/billing/subscription',
    PAYMENT_METHODS: '/billing/payment-methods',
    CHECKOUT_SESSION: '/billing/checkout-session',
  },
}

// API Response Types
export const API_RESPONSES = {
  // Error envelope for 4xx and 5xx
  ERROR: {
    error: 'string',
    code: 'string',
    details: 'optional'
  },

  // Catalog list response
  CATALOG_LIST: {
    items: 'array of Title summary',
    page: 'number',
    pageSize: 'number',
    total: 'number',
    hasMore: 'boolean'
  },

  // Title detail response
  TITLE_DETAIL: {
    // Title object with optional seasons/episodes for series
    // or runtimeSec/playbackUrl for movies
  },

  // Rows response
  ROWS: {
    // Array of { name, items: Title summary[] }
  },

  // Watchlist toggle response
  WATCHLIST_TOGGLE: {
    ok: 'boolean',
    inList: 'boolean'
  },

  // Progress response
  PROGRESS: {
    ok: 'boolean'
  },

  // Checkout session response
  CHECKOUT_SESSION: {
    url: 'string'
  }
}

// Query parameter types for catalog
export const CATALOG_PARAMS = {
  q: 'string (optional) - full text query',
  genre: 'string (optional) - single genre value',
  year: 'number (optional) - release year',
  kind: '"movie" or "series" (optional)',
  sort: '"trending" or "new" or "top" (optional, default "new")',
  page: 'number (default 1)',
  pageSize: 'number (default 24, max 48)'
}

// Row keys for home page
export const ROW_KEYS = {
  POPULAR: 'popular',
  TRENDING: 'trending',
  NEW: 'new',
  CONTINUE: 'continue',
  MYLIST: 'mylist',
  GENRE_PREFIX: 'genre-'
}

export default API_ENDPOINTS
