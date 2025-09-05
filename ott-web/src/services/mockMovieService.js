// Mock movie service to replace Supabase temporarily
// This will be used until you set up your AWS-based movie database

const mockMovies = [
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
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/BigBuckBunny/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/BigBuckBunny/master.m3u8',
    // Fallback video URLs for testing
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
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
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/ElephantsDream/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/ElephantsDream/master.m3u8',
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
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
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Sintel/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Sintel/master.m3u8',
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    runtime_sec: 888, // 14 minutes 48 seconds
    is_featured: false,
    created_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Tornado',
    synopsis: 'A short animated film about a tornado that forms in a small town and the chaos it brings.',
    year: 2012,
    rating: 'U/A 7+',
    kind: 'movie',
    genres: ['Animation', 'Action', 'Disaster'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Tornado.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Tornado.jpg',
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Tornado/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Tornado/master.m3u8',
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Tornado.mp4',
    runtime_sec: 480, // 8 minutes
    is_featured: false,
    created_at: '2024-01-04T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Cosmos Laundromat',
    synopsis: 'A suicidal salesman gets a second chance at life when he meets a mysterious salesman who offers him a deal.',
    year: 2015,
    rating: 'U/A 16+',
    kind: 'movie',
    genres: ['Animation', 'Drama', 'Fantasy'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/CosmosLaundromat.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/CosmosLaundromat.jpg',
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/CosmosLaundromat/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/CosmosLaundromat/master.m3u8',
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/CosmosLaundromat.mp4',
    runtime_sec: 720, // 12 minutes
    is_featured: false,
    created_at: '2024-01-05T00:00:00Z'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Agent 327: Operation Barbershop',
    synopsis: 'Dutch secret agent Martin is on a mission to stop a criminal organization from stealing a powerful weapon.',
    year: 2017,
    rating: 'U/A 13+',
    kind: 'movie',
    genres: ['Animation', 'Action', 'Comedy'],
    poster_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Agent327.jpg',
    hero_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Agent327.jpg',
    video_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Agent327/master.m3u8',
    playback_url: 'https://ott-movie-storage.s3.ap-south-1.amazonaws.com/movies/Agent327/master.m3u8',
    fallback_video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Agent327.mp4',
    runtime_sec: 600, // 10 minutes
    is_featured: false,
    created_at: '2024-01-06T00:00:00Z'
  }
];

export const mockMovieService = {
  // Get all movies
  async getMovies() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMovies;
  },

  // Get featured movie (Big Buck Bunny)
  async getFeaturedMovie() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockMovies.find(movie => movie.is_featured) || mockMovies[0];
  },

  // Get movie by ID
  async getMovieById(id) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockMovies.find(movie => movie.id === id) || null;
  },

  // Get movies by genre
  async getMoviesByGenre(genre) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockMovies.filter(movie => 
      movie.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
    );
  },

  // Search movies
  async searchMovies(query) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const searchTerm = query.toLowerCase();
    return mockMovies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.synopsis.toLowerCase().includes(searchTerm) ||
      movie.genres.some(genre => genre.toLowerCase().includes(searchTerm))
    );
  }
};

export default mockMovieService;
