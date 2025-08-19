-- Mock Data for OTT Platform
-- Run this after creating the schema

-- Sample genres and ratings
-- Genres: Action, Drama, Comedy, Thriller, Sci-Fi, Documentary, Romance
-- Ratings: U, U/A 7+, U/A 13+, U/A 16+, A

-- Insert Movies (20 items)
INSERT INTO public.titles (id, kind, slug, title, synopsis, year, rating, runtime_sec, genres, tags, poster_url, hero_url, trailer_url, playback_url, subtitles, created_at) VALUES
-- Action Movies
('movie-1', 'movie', 'the-avengers', 'The Avengers', 'Earth''s mightiest heroes must come together to stop Loki and his alien army from enslaving humanity.', 2012, 'U/A 13+', 8580, ARRAY['Action', 'Sci-Fi'], ARRAY['superhero', 'marvel', 'team'], 'https://via.placeholder.com/600x900/1f2937/ffffff?text=Avengers', 'https://via.placeholder.com/1920x1080/1f2937/ffffff?text=Avengers+Hero', 'https://example.com/trailers/avengers.mp4', 'https://example.com/playback/avengers/master.m3u8', '[]', NOW() - INTERVAL '1 day'),

('movie-2', 'movie', 'mad-max-fury-road', 'Mad Max: Fury Road', 'A post-apocalyptic action film following Max and Furiosa as they escape from a tyrannical ruler.', 2015, 'U/A 16+', 7200, ARRAY['Action', 'Sci-Fi'], ARRAY['post-apocalyptic', 'dystopian', 'chase'], 'https://via.placeholder.com/600x900/374151/ffffff?text=Mad+Max', 'https://via.placeholder.com/1920x1080/374151/ffffff?text=Mad+Max+Hero', 'https://example.com/trailers/madmax.mp4', 'https://example.com/playback/madmax/master.m3u8', '[]', NOW() - INTERVAL '2 days'),

('movie-3', 'movie', 'john-wick', 'John Wick', 'An ex-hitman comes out of retirement to track down the gangsters who killed his dog and stole his car.', 2014, 'U/A 16+', 6060, ARRAY['Action', 'Thriller'], ARRAY['assassin', 'revenge', 'gun-fu'], 'https://via.placeholder.com/600x900/4b5563/ffffff?text=John+Wick', 'https://via.placeholder.com/1920x1080/4b5563/ffffff?text=John+Wick+Hero', 'https://example.com/trailers/johnwick.mp4', 'https://example.com/playback/johnwick/master.m3u8', '[]', NOW() - INTERVAL '3 days'),

-- Drama Movies
('movie-4', 'movie', 'the-shawshank-redemption', 'The Shawshank Redemption', 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', 1994, 'U/A 16+', 9120, ARRAY['Drama'], ARRAY['prison', 'friendship', 'redemption'], 'https://via.placeholder.com/600x900/6b7280/ffffff?text=Shawshank', 'https://via.placeholder.com/1920x1080/6b7280/ffffff?text=Shawshank+Hero', 'https://example.com/trailers/shawshank.mp4', 'https://example.com/playback/shawshank/master.m3u8', '[]', NOW() - INTERVAL '4 days'),

('movie-5', 'movie', 'forrest-gump', 'Forrest Gump', 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.', 1994, 'U/A 13+', 8520, ARRAY['Drama', 'Comedy'], ARRAY['historical', 'inspirational', 'southern'], 'https://via.placeholder.com/600x900/9ca3af/ffffff?text=Forrest+Gump', 'https://via.placeholder.com/1920x1080/9ca3af/ffffff?text=Forrest+Gump+Hero', 'https://example.com/trailers/forrestgump.mp4', 'https://example.com/playback/forrestgump/master.m3u8', '[]', NOW() - INTERVAL '5 days'),

-- Comedy Movies
('movie-6', 'movie', 'the-grand-budapest-hotel', 'The Grand Budapest Hotel', 'A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel''s glorious years under an exceptional concierge.', 2014, 'U/A 13+', 5940, ARRAY['Comedy', 'Drama'], ARRAY['witty', 'european', 'hotel'], 'https://via.placeholder.com/600x900/d1d5db/ffffff?text=Budapest', 'https://via.placeholder.com/1920x1080/d1d5db/ffffff?text=Budapest+Hero', 'https://example.com/trailers/budapest.mp4', 'https://example.com/playback/budapest/master.m3u8', '[]', NOW() - INTERVAL '6 days'),

('movie-7', 'movie', 'superbad', 'Superbad', 'Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.', 2007, 'U/A 16+', 6840, ARRAY['Comedy'], ARRAY['teen', 'party', 'friendship'], 'https://via.placeholder.com/600x900/e5e7eb/ffffff?text=Superbad', 'https://via.placeholder.com/1920x1080/e5e7eb/ffffff?text=Superbad+Hero', 'https://example.com/trailers/superbad.mp4', 'https://example.com/playback/superbad/master.m3u8', '[]', NOW() - INTERVAL '7 days'),

-- Thriller Movies
('movie-8', 'movie', 'inception', 'Inception', 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', 2010, 'U/A 13+', 8880, ARRAY['Thriller', 'Sci-Fi'], ARRAY['dreams', 'heist', 'mind-bending'], 'https://via.placeholder.com/600x900/ef4444/ffffff?text=Inception', 'https://via.placeholder.com/1920x1080/ef4444/ffffff?text=Inception+Hero', 'https://example.com/trailers/inception.mp4', 'https://example.com/playback/inception/master.m3u8', '[]', NOW() - INTERVAL '8 days'),

('movie-9', 'movie', 'the-silence-of-the-lambs', 'The Silence of the Lambs', 'A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer.', 1991, 'U/A 16+', 7080, ARRAY['Thriller', 'Drama'], ARRAY['serial-killer', 'psychological', 'fbi'], 'https://via.placeholder.com/600x900/f97316/ffffff?text=Silence', 'https://via.placeholder.com/1920x1080/f97316/ffffff?text=Silence+Hero', 'https://example.com/trailers/silence.mp4', 'https://example.com/playback/silence/master.m3u8', '[]', NOW() - INTERVAL '9 days'),

-- Sci-Fi Movies
('movie-10', 'movie', 'blade-runner-2049', 'Blade Runner 2049', 'A young blade runner''s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard.', 2017, 'U/A 16+', 9540, ARRAY['Sci-Fi', 'Drama'], ARRAY['cyberpunk', 'neo-noir', 'sequel'], 'https://via.placeholder.com/600x900/eab308/ffffff?text=Blade+Runner', 'https://via.placeholder.com/1920x1080/eab308/ffffff?text=Blade+Runner+Hero', 'https://example.com/trailers/bladerunner.mp4', 'https://example.com/playback/bladerunner/master.m3u8', '[]', NOW() - INTERVAL '10 days'),

('movie-11', 'movie', 'ex-machina', 'Ex Machina', 'A young programmer is selected to participate in a ground-breaking experiment in synthetic intelligence by evaluating the human qualities of a highly advanced humanoid A.I.', 2014, 'U/A 16+', 6480, ARRAY['Sci-Fi', 'Thriller'], ARRAY['ai', 'psychological', 'isolation'], 'https://via.placeholder.com/600x900/84cc16/ffffff?text=Ex+Machina', 'https://via.placeholder.com/1920x1080/84cc16/ffffff?text=Ex+Machina+Hero', 'https://example.com/trailers/exmachina.mp4', 'https://example.com/playback/exmachina/master.m3u8', '[]', NOW() - INTERVAL '11 days'),

-- Documentary Movies
('movie-12', 'movie', 'planet-earth-ii', 'Planet Earth II', 'Documentary series exploring the most beautiful and diverse places on Earth.', 2016, 'U', 3600, ARRAY['Documentary'], ARRAY['nature', 'wildlife', 'earth'], 'https://via.placeholder.com/600x900/22c55e/ffffff?text=Planet+Earth', 'https://via.placeholder.com/1920x1080/22c55e/ffffff?text=Planet+Earth+Hero', 'https://example.com/trailers/planetearth.mp4', 'https://example.com/playback/planetearth/master.m3u8', '[]', NOW() - INTERVAL '12 days'),

('movie-13', 'movie', 'the-last-dance', 'The Last Dance', 'Charting the rise of the 1990s Chicago Bulls, led by Michael Jordan, one of the most notable dynasties in sports history.', 2020, 'U/A 13+', 6000, ARRAY['Documentary', 'Sports'], ARRAY['basketball', 'michael-jordan', 'chicago-bulls'], 'https://via.placeholder.com/600x900/06b6d4/ffffff?text=Last+Dance', 'https://via.placeholder.com/1920x1080/06b6d4/ffffff?text=Last+Dance+Hero', 'https://example.com/trailers/lastdance.mp4', 'https://example.com/playback/lastdance/master.m3u8', '[]', NOW() - INTERVAL '13 days'),

-- Romance Movies
('movie-14', 'movie', 'la-la-land', 'La La Land', 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.', 2016, 'U/A 13+', 7680, ARRAY['Romance', 'Musical'], ARRAY['musical', 'hollywood', 'dreams'], 'https://via.placeholder.com/600x900/8b5cf6/ffffff?text=La+La+Land', 'https://via.placeholder.com/1920x1080/8b5cf6/ffffff?text=La+La+Land+Hero', 'https://example.com/trailers/lalaland.mp4', 'https://example.com/playback/lalaland/master.m3u8', '[]', NOW() - INTERVAL '14 days'),

('movie-15', 'movie', 'eternal-sunshine', 'Eternal Sunshine of the Spotless Mind', 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.', 2004, 'U/A 16+', 6480, ARRAY['Romance', 'Sci-Fi'], ARRAY['memory', 'love', 'mind-bending'], 'https://via.placeholder.com/600x900/ec4899/ffffff?text=Eternal+Sunshine', 'https://via.placeholder.com/1920x1080/ec4899/ffffff?text=Eternal+Sunshine+Hero', 'https://example.com/trailers/eternalsunshine.mp4', 'https://example.com/playback/eternalsunshine/master.m3u8', '[]', NOW() - INTERVAL '15 days'),

-- More Action Movies
('movie-16', 'movie', 'mission-impossible', 'Mission: Impossible', 'An American agent, under false suspicion of disloyalty, must discover and expose the real spy without the help of his organization.', 1996, 'U/A 13+', 6600, ARRAY['Action', 'Thriller'], ARRAY['spy', 'heist', 'tom-cruise'], 'https://via.placeholder.com/600x900/f43f5e/ffffff?text=Mission+Impossible', 'https://via.placeholder.com/1920x1080/f43f5e/ffffff?text=Mission+Impossible+Hero', 'https://example.com/trailers/missionimpossible.mp4', 'https://example.com/playback/missionimpossible/master.m3u8', '[]', NOW() - INTERVAL '16 days'),

('movie-17', 'movie', 'die-hard', 'Die Hard', 'An action classic where an action hero tries to save his wife, several hostages and innocent people from a group of international terrorists.', 1988, 'U/A 16+', 7920, ARRAY['Action', 'Thriller'], ARRAY['christmas', 'terrorist', 'one-man-army'], 'https://via.placeholder.com/600x900/a855f7/ffffff?text=Die+Hard', 'https://via.placeholder.com/1920x1080/a855f7/ffffff?text=Die+Hard+Hero', 'https://example.com/trailers/diehard.mp4', 'https://example.com/playback/diehard/master.m3u8', '[]', NOW() - INTERVAL '17 days'),

('movie-18', 'movie', 'the-dark-knight', 'The Dark Knight', 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', 2008, 'U/A 13+', 9120, ARRAY['Action', 'Drama'], ARRAY['batman', 'joker', 'superhero'], 'https://via.placeholder.com/600x900/14b8a6/ffffff?text=Dark+Knight', 'https://via.placeholder.com/1920x1080/14b8a6/ffffff?text=Dark+Knight+Hero', 'https://example.com/trailers/darkknight.mp4', 'https://example.com/playback/darkknight/master.m3u8', '[]', NOW() - INTERVAL '18 days'),

('movie-19', 'movie', 'gladiator', 'Gladiator', 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.', 2000, 'U/A 16+', 9300, ARRAY['Action', 'Drama'], ARRAY['rome', 'gladiator', 'revenge'], 'https://via.placeholder.com/600x900/f59e0b/ffffff?text=Gladiator', 'https://via.placeholder.com/1920x1080/f59e0b/ffffff?text=Gladiator+Hero', 'https://example.com/trailers/gladiator.mp4', 'https://example.com/playback/gladiator/master.m3u8', '[]', NOW() - INTERVAL '19 days'),

('movie-20', 'movie', 'the-matrix', 'The Matrix', 'A computer programmer discovers that reality as he knows it is a simulation created by machines, and joins a rebellion to break free.', 1999, 'U/A 16+', 8160, ARRAY['Action', 'Sci-Fi'], ARRAY['virtual-reality', 'kung-fu', 'philosophy'], 'https://via.placeholder.com/600x900/10b981/ffffff?text=Matrix', 'https://via.placeholder.com/1920x1080/10b981/ffffff?text=Matrix+Hero', 'https://example.com/trailers/matrix.mp4', 'https://example.com/playback/matrix/master.m3u8', '[]', NOW() - INTERVAL '20 days');

-- Insert Series (10 items)
INSERT INTO public.titles (id, kind, slug, title, synopsis, year, rating, genres, tags, poster_url, hero_url, trailer_url, subtitles, created_at) VALUES
-- Drama Series
('series-1', 'series', 'breaking-bad', 'Breaking Bad', 'A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family''s financial future as a terminal illness puts his life at risk.', 2008, 'U/A 16+', ARRAY['Drama', 'Thriller'], ARRAY['crime', 'chemistry', 'family'], 'https://via.placeholder.com/600x900/1f2937/ffffff?text=Breaking+Bad', 'https://via.placeholder.com/1920x1080/1f2937/ffffff?text=Breaking+Bad+Hero', 'https://example.com/trailers/breakingbad.mp4', '[]', NOW() - INTERVAL '21 days'),

('series-2', 'series', 'game-of-thrones', 'Game of Thrones', 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.', 2011, 'U/A 16+', ARRAY['Drama', 'Fantasy'], ARRAY['medieval', 'politics', 'dragons'], 'https://via.placeholder.com/600x900/374151/ffffff?text=Game+of+Thrones', 'https://via.placeholder.com/1920x1080/374151/ffffff?text=Game+of+Thrones+Hero', 'https://example.com/trailers/gameofthrones.mp4', '[]', NOW() - INTERVAL '22 days'),

('series-3', 'series', 'stranger-things', 'Stranger Things', 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.', 2016, 'U/A 13+', ARRAY['Drama', 'Sci-Fi'], ARRAY['supernatural', '80s', 'kids'], 'https://via.placeholder.com/600x900/4b5563/ffffff?text=Stranger+Things', 'https://via.placeholder.com/1920x1080/4b5563/ffffff?text=Stranger+Things+Hero', 'https://example.com/trailers/strangerthings.mp4', '[]', NOW() - INTERVAL '23 days'),

('series-4', 'series', 'the-crown', 'The Crown', 'Follows the political rivalries and romance of Queen Elizabeth II''s reign and the events that shaped the second half of the twentieth century.', 2016, 'U/A 13+', ARRAY['Drama', 'History'], ARRAY['royalty', 'britain', 'politics'], 'https://via.placeholder.com/600x900/6b7280/ffffff?text=The+Crown', 'https://via.placeholder.com/1920x1080/6b7280/ffffff?text=The+Crown+Hero', 'https://example.com/trailers/crown.mp4', '[]', NOW() - INTERVAL '24 days'),

('series-5', 'series', 'the-mandalorian', 'The Mandalorian', 'The travels of a lone bounty hunter in the outer reaches of the galaxy, far from the authority of the New Republic.', 2019, 'U/A 7+', ARRAY['Action', 'Sci-Fi'], ARRAY['star-wars', 'bounty-hunter', 'western'], 'https://via.placeholder.com/600x900/9ca3af/ffffff?text=Mandalorian', 'https://via.placeholder.com/1920x1080/9ca3af/ffffff?text=Mandalorian+Hero', 'https://example.com/trailers/mandalorian.mp4', '[]', NOW() - INTERVAL '25 days'),

('series-6', 'series', 'the-office', 'The Office', 'A mockumentary on a group of typical office workers, where the workday consists of ego clashes, inappropriate behavior, and tedium.', 2005, 'U/A 13+', ARRAY['Comedy'], ARRAY['workplace', 'mockumentary', 'awkward'], 'https://via.placeholder.com/600x900/d1d5db/ffffff?text=The+Office', 'https://via.placeholder.com/1920x1080/d1d5db/ffffff?text=The+Office+Hero', 'https://example.com/trailers/office.mp4', '[]', NOW() - INTERVAL '26 days'),

('series-7', 'series', 'friends', 'Friends', 'Follows the personal and professional lives of six twenty to thirty-something-year-old friends living in Manhattan.', 1994, 'U/A 7+', ARRAY['Comedy', 'Romance'], ARRAY['sitcom', 'friendship', 'new-york'], 'https://via.placeholder.com/600x900/e5e7eb/ffffff?text=Friends', 'https://via.placeholder.com/1920x1080/e5e7eb/ffffff?text=Friends+Hero', 'https://example.com/trailers/friends.mp4', '[]', NOW() - INTERVAL '27 days'),

('series-8', 'series', 'black-mirror', 'Black Mirror', 'An anthology series exploring a twisted, high-tech multiverse where humanity''s greatest innovations and darkest instincts collide.', 2011, 'U/A 16+', ARRAY['Drama', 'Sci-Fi'], ARRAY['anthology', 'technology', 'dystopian'], 'https://via.placeholder.com/600x900/ef4444/ffffff?text=Black+Mirror', 'https://via.placeholder.com/1920x1080/ef4444/ffffff?text=Black+Mirror+Hero', 'https://example.com/trailers/blackmirror.mp4', '[]', NOW() - INTERVAL '28 days'),

('series-9', 'series', 'the-witcher', 'The Witcher', 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.', 2019, 'U/A 16+', ARRAY['Action', 'Fantasy'], ARRAY['monster-hunter', 'magic', 'medieval'], 'https://via.placeholder.com/600x900/f97316/ffffff?text=The+Witcher', 'https://via.placeholder.com/1920x1080/f97316/ffffff?text=The+Witcher+Hero', 'https://example.com/trailers/witcher.mp4', '[]', NOW() - INTERVAL '29 days'),

('series-10', 'series', 'money-heist', 'Money Heist', 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.', 2017, 'U/A 16+', ARRAY['Action', 'Drama'], ARRAY['heist', 'spain', 'robbery'], 'https://via.placeholder.com/600x900/eab308/ffffff?text=Money+Heist', 'https://via.placeholder.com/1920x1080/eab308/ffffff?text=Money+Heist+Hero', 'https://example.com/trailers/moneyheist.mp4', '[]', NOW() - INTERVAL '30 days');

-- Insert Seasons for Series (2 seasons each)
INSERT INTO public.seasons (id, title_id, season_number, overview) VALUES
-- Breaking Bad Seasons
('season-1-1', 'series-1', 1, 'Walter White, a chemistry teacher, discovers he has terminal cancer and decides to get into the meth-making business to secure his family''s financial future.'),
('season-1-2', 'series-1', 2, 'Walter White continues his transformation into Heisenberg, while his relationship with Jesse becomes more complex.'),

-- Game of Thrones Seasons
('season-2-1', 'series-2', 1, 'The first season follows the Stark family and their allies as they navigate the political landscape of Westeros.'),
('season-2-2', 'series-2', 2, 'The second season sees the War of the Five Kings intensify as various factions vie for the Iron Throne.'),

-- Stranger Things Seasons
('season-3-1', 'series-3', 1, 'When a young boy disappears, his mother and friends must confront supernatural forces to get him back.'),
('season-3-2', 'series-3', 2, 'The second season explores the aftermath of the first season''s events and introduces new threats.'),

-- The Crown Seasons
('season-4-1', 'series-4', 1, 'The first season covers the early years of Queen Elizabeth II''s reign, from her coronation to the Suez Crisis.'),
('season-4-2', 'series-4', 2, 'The second season explores the Queen''s relationship with Prime Minister Harold Macmillan and the Profumo affair.'),

-- The Mandalorian Seasons
('season-5-1', 'series-5', 1, 'A lone bounty hunter navigates the outer reaches of the galaxy, far from the authority of the New Republic.'),
('season-5-2', 'series-5', 2, 'The second season sees the Mandalorian continue his quest while facing new challenges and enemies.'),

-- The Office Seasons
('season-6-1', 'series-6', 1, 'The first season introduces the quirky employees of Dunder Mifflin Paper Company in Scranton, Pennsylvania.'),
('season-6-2', 'series-6', 2, 'The second season explores the relationships and antics of the office workers as they navigate their daily lives.'),

-- Friends Seasons
('season-7-1', 'series-7', 1, 'The first season follows six friends in their twenties as they navigate life, love, and work in Manhattan.'),
('season-7-2', 'series-7', 2, 'The second season sees the friends dealing with new relationships and life changes.'),

-- Black Mirror Seasons
('season-8-1', 'series-8', 1, 'The first season presents three standalone episodes exploring the dark side of technology and human nature.'),
('season-8-2', 'series-8', 2, 'The second season continues the anthology format with more thought-provoking tales about technology and society.'),

-- The Witcher Seasons
('season-9-1', 'series-9', 1, 'Geralt of Rivia, a monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.'),
('season-9-2', 'series-9', 2, 'The second season explores Geralt''s past and his relationship with Ciri, the child of destiny.'),

-- Money Heist Seasons
('season-10-1', 'series-10', 1, 'A group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing from the Royal Mint.'),
('season-10-2', 'series-10', 2, 'The second season sees the robbers attempt an even more ambitious heist at the Bank of Spain.');

-- Insert Episodes for each season (6 episodes per season)
-- This is a sample for the first few series, you can expand as needed
INSERT INTO public.episodes (id, title_id, season_number, episode_number, title, synopsis, runtime_sec, playback_url, subtitles) VALUES
-- Breaking Bad Season 1 Episodes
('ep-1-1-1', 'series-1', 1, 1, 'Pilot', 'Walter White, a chemistry teacher, discovers he has terminal cancer and decides to get into the meth-making business.', 3600, 'https://example.com/playback/breakingbad/s1e1/master.m3u8', '[]'),
('ep-1-1-2', 'series-1', 1, 2, 'Cat''s in the Bag...', 'Walter and Jesse try to dispose of two dead bodies and find themselves in even more trouble.', 3600, 'https://example.com/playback/breakingbad/s1e2/master.m3u8', '[]'),
('ep-1-1-3', 'series-1', 1, 3, '...And the Bag''s in the River', 'Walter must decide whether to kill Krazy-8 or let him go, while Skyler grows suspicious of her husband.', 3600, 'https://example.com/playback/breakingbad/s1e3/master.m3u8', '[]'),
('ep-1-1-4', 'series-1', 1, 4, 'Cancer Man', 'Walter tells his family about his cancer diagnosis and begins his treatment.', 3600, 'https://example.com/playback/breakingbad/s1e4/master.m3u8', '[]'),
('ep-1-1-5', 'series-1', 1, 5, 'Gray Matter', 'Walter''s old business partners offer to pay for his cancer treatment, but his pride gets in the way.', 3600, 'https://example.com/playback/breakingbad/s1e5/master.m3u8', '[]'),
('ep-1-1-6', 'series-1', 1, 6, 'Crazy Handful of Nothin''', 'Walter makes his first drug deal and proves he''s not to be underestimated.', 3600, 'https://example.com/playback/breakingbad/s1e6/master.m3u8', '[]'),

-- Breaking Bad Season 2 Episodes
('ep-1-2-1', 'series-1', 2, 1, 'Seven Thirty-Seven', 'Walter and Jesse deal with the aftermath of Tuco''s death and plan their next move.', 3600, 'https://example.com/playback/breakingbad/s2e1/master.m3u8', '[]'),
('ep-1-2-2', 'series-1', 2, 2, 'Grilled', 'Walter and Jesse are held captive by Tuco''s uncle, who is even more dangerous than Tuco.', 3600, 'https://example.com/playback/breakingbad/s2e2/master.m3u8', '[]'),
('ep-1-2-3', 'series-1', 2, 3, 'Bit by a Dead Bee', 'Walter and Jesse recover from their ordeal and try to get back to normal life.', 3600, 'https://example.com/playback/breakingbad/s2e3/master.m3u8', '[]'),
('ep-1-2-4', 'series-1', 2, 4, 'Down', 'Walter''s relationship with Skyler deteriorates as he becomes more involved in the drug trade.', 3600, 'https://example.com/playback/breakingbad/s2e4/master.m3u8', '[]'),
('ep-1-2-5', 'series-1', 2, 5, 'Breakage', 'Walter and Jesse expand their operation and face new challenges.', 3600, 'https://example.com/playback/breakingbad/s2e5/master.m3u8', '[]'),
('ep-1-2-6', 'series-1', 2, 6, 'Peekaboo', 'Jesse deals with a difficult situation while Walter focuses on his family.', 3600, 'https://example.com/playback/breakingbad/s2e6/master.m3u8', '[]');

-- Add more episodes for other series as needed...
-- For brevity, I've included a sample for Breaking Bad
-- You can expand this with episodes for all series following the same pattern
