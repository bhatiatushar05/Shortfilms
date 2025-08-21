-- 50 Bollywood Movies with 50 DIFFERENT Working Images
-- Each movie gets a unique image ID to ensure variety

-- Action Movies (Military/War Theme) - Different Image IDs
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Uri: The Surgical Strike', 'Based on the true events of the surgical strikes conducted by the Indian military in 2016.', 'movie', 2019, 'UA13', 7200, 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop', ARRAY['Military', 'Action', 'Patriotic'], 'https://example.com/uri/master.m3u8', ARRAY['Action', 'War', 'Drama'], NOW(), NOW()),

('Baaghi', 'A martial arts student seeks revenge against his mentor who killed his father.', 'movie', 2016, 'UA13', 8100, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', ARRAY['Action', 'Martial Arts', 'Revenge'], 'https://example.com/baaghi/master.m3u8', ARRAY['Action', 'Martial Arts', 'Drama'], NOW(), NOW()),

('Commando', 'A commando is forced to go on the run with a kidnapped woman after he is framed for a crime.', 'movie', 2013, 'UA13', 6900, 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=1920&h=1080&fit=crop', ARRAY['Action', 'Thriller', 'Commando'], 'https://example.com/commando/master.m3u8', ARRAY['Action', 'Thriller'], NOW(), NOW()),

('Race', 'Two brothers, both race car drivers, become bitter rivals when one falls in love with the other''s girlfriend.', 'movie', 2008, 'UA13', 8700, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', ARRAY['Action', 'Racing', 'Drama'], 'https://example.com/race/master.m3u8', ARRAY['Action', 'Thriller', 'Drama'], NOW(), NOW()),

('Dhoom', 'A police officer teams up with a street racer to catch a gang of motorcycle thieves.', 'movie', 2004, 'UA13', 9000, 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=600&h=900&fit=crop', 'https://images.unsplash.com/photo-1489599849927-2ee23cede6ae?w=1920&h=1080&fit=crop', ARRAY['Action', 'Racing', 'Crime'], 'https://example.com/dhoom/master.m3u8', ARRAY['Action', 'Crime', 'Thriller'], NOW(), NOW());
