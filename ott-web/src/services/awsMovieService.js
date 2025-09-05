

/**
 * AWS Movie Service for ShortCinema OTT
 * This service handles real movies from AWS S3 bucket
 */

// Sample movies with real AWS S3 URLs (you'll replace these with your actual movies)
const awsMovies = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Big Buck Bunny',
    synopsis: 'Big Buck Bunny tells the story of a giant rabbit with a heart bigger than himself. When one sunny day three rodents rudely harass him through physical humor, the rabbit amiably gives the rodents a lesson, building them a cute wooden cart, ready to drive them across the pond.',
    year: 2008,
    rating: 'U',
    kind: 'movie',
    genres: ['Animation', 'Comedy', 'Family'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    runtime_sec: 600, // 10 minutes
    is_featured: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Elephants Dream',
    synopsis: 'The world\'s first open movie, made entirely with open source software. A short animated film about the mysterious world of machines and the people who work with them.',
    year: 2006,
    rating: 'U/A 7+',
    kind: 'movie',
    genres: ['Animation', 'Sci-Fi', 'Short'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    runtime_sec: 660, // 11 minutes
    is_featured: false,
    created_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Sintel',
    synopsis: 'A girl searching for her lost dragon friend in a fantasy world. A short animated film about love and loss.',
    year: 2010,
    rating: 'U/A 13+',
    kind: 'movie',
    genres: ['Animation', 'Fantasy', 'Adventure'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    playback_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    runtime_sec: 888, // 14 minutes 48 seconds
    is_featured: false,
    created_at: '2024-01-03T00:00:00Z'
  }
];

// Configuration for AWS S3 bucket
const AWS_CONFIG = {
  // Replace these with your actual AWS S3 bucket details
  bucketName: 'shortcinema-ott-content', // Your S3 bucket name
  region: 'us-east-1', // Your AWS region
  baseUrl: `https://shortcinema-ott-content.s3.us-east-1.amazonaws.com`, // Will be updated with your bucket
  // If you have CloudFront, use this instead:
  // baseUrl: 'https://your-cloudfront-domain.cloudfront.net'
};

// Function to get movie URL from S3
const getMovieUrl = (movieId, format = 'mp4') => {
  // For now, using sample videos. Replace with your actual S3 URLs
  if (format === 'hls') {
    return `${AWS_CONFIG.baseUrl}/movies/${movieId}/master.m3u8`;
  }
  return `${AWS_CONFIG.baseUrl}/movies/${movieId}/movie.${format}`;
};

// Function to get poster URL from S3
const getPosterUrl = (movieId) => {
  return `${AWS_CONFIG.baseUrl}/posters/${movieId}/poster.jpg`;
};

// Function to get hero image URL from S3
const getHeroUrl = (movieId) => {
  return `${AWS_CONFIG.baseUrl}/heroes/${movieId}/hero.jpg`;
};

export const awsMovieService = {
  // Get all movies
  async getMovies() {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return movies with updated URLs
      return awsMovies.map(movie => ({
        ...movie,
        video_url: getMovieUrl(movie.id, 'mp4'),
        playback_url: getMovieUrl(movie.id, 'mp4'),
        poster_url: getPosterUrl(movie.id),
        hero_url: getHeroUrl(movie.id)
      }));
    } catch (error) {
      console.error('Error fetching movies:', error);
      return [];
    }
  },

  // Get featured movie
  async getFeaturedMovie() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const featured = awsMovies.find(movie => movie.is_featured) || awsMovies[0];
      
      return {
        ...featured,
        video_url: getMovieUrl(featured.id, 'mp4'),
        playback_url: getMovieUrl(featured.id, 'mp4'),
        poster_url: getPosterUrl(featured.id),
        hero_url: getHeroUrl(featured.id)
      };
    } catch (error) {
      console.error('Error fetching featured movie:', error);
      return null;
    }
  },

  // Get movie by ID
  async getMovieById(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const movie = awsMovies.find(movie => movie.id === id);
      
      if (!movie) return null;
      
      return {
        ...movie,
        video_url: getMovieUrl(movie.id, 'mp4'),
        playback_url: getMovieUrl(movie.id, 'mp4'),
        poster_url: getPosterUrl(movie.id),
        hero_url: getHeroUrl(movie.id)
      };
    } catch (error) {
      console.error('Error fetching movie by ID:', error);
      return null;
    }
  },

  // Get movies by genre
  async getMoviesByGenre(genre) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const filtered = awsMovies.filter(movie => 
        movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
      );
      
      return filtered.map(movie => ({
        ...movie,
        video_url: getMovieUrl(movie.id, 'mp4'),
        playback_url: getMovieUrl(movie.id, 'mp4'),
        poster_url: getPosterUrl(movie.id),
        hero_url: getHeroUrl(movie.id)
      }));
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      return [];
    }
  },

  // Search movies
  async searchMovies(query) {
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const searchTerm = query.toLowerCase();
      const filtered = awsMovies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.synopsis.toLowerCase().includes(searchTerm) ||
        movie.genres.some(genre => genre.toLowerCase().includes(searchTerm))
      );
      
      return filtered.map(movie => ({
        ...movie,
        video_url: getMovieUrl(movie.id, 'mp4'),
        playback_url: getMovieUrl(movie.id, 'mp4'),
        poster_url: getPosterUrl(movie.id),
        hero_url: getHeroUrl(movie.id)
      }));
    } catch (error) {
      console.error('Error searching movies:', error);
      return [];
    }
  },

  // Update AWS configuration
  updateConfig(newConfig) {
    Object.assign(AWS_CONFIG, newConfig);
    console.log('AWS configuration updated:', AWS_CONFIG);
  },

  // Get current AWS configuration
  getConfig() {
    return { ...AWS_CONFIG };
  },

  // Test AWS connection
  async testConnection() {
    try {
      // Test if we can access the base URL
      const testUrl = `${AWS_CONFIG.baseUrl}/test-connection`;
      const response = await fetch(testUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error('AWS connection test failed:', error);
      return false;
    }
  }
};

export default awsMovieService;

