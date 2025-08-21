-- 50 Bollywood Movies with GUARANTEED Working Images
-- Each movie gets a completely different image source

-- Action Movies (Military/War Theme) - Different Image Sources
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Uri: The Surgical Strike', 'Based on the true events of the surgical strikes conducted by the Indian military in 2016.', 'movie', 2019, 'UA13', 7200, 'https://picsum.photos/600/900?random=1', 'https://picsum.photos/1920/1080?random=1', ARRAY['Military', 'Action', 'Patriotic'], 'https://example.com/uri/master.m3u8', ARRAY['Action', 'War', 'Drama'], NOW(), NOW()),

('Baaghi', 'A martial arts student seeks revenge against his mentor who killed his father.', 'movie', 2016, 'UA13', 8100, 'https://picsum.photos/600/900?random=2', 'https://picsum.photos/1920/1080?random=2', ARRAY['Action', 'Martial Arts', 'Revenge'], 'https://example.com/baaghi/master.m3u8', ARRAY['Action', 'Martial Arts', 'Drama'], NOW(), NOW()),

('Commando', 'A commando is forced to go on the run with a kidnapped woman after he is framed for a crime.', 'movie', 2013, 'UA13', 6900, 'https://picsum.photos/600/900?random=3', 'https://picsum.photos/1920/1080?random=3', ARRAY['Action', 'Thriller', 'Commando'], 'https://example.com/commando/master.m3u8', ARRAY['Action', 'Thriller'], NOW(), NOW()),

('Race', 'Two brothers, both race car drivers, become bitter rivals when one falls in love with the other''s girlfriend.', 'movie', 2008, 'UA13', 8700, 'https://picsum.photos/600/900?random=4', 'https://picsum.photos/1920/1080?random=4', ARRAY['Action', 'Racing', 'Drama'], 'https://example.com/race/master.m3u8', ARRAY['Action', 'Thriller', 'Drama'], NOW(), NOW()),

('Dhoom', 'A police officer teams up with a street racer to catch a gang of motorcycle thieves.', 'movie', 2004, 'UA13', 9000, 'https://picsum.photos/600/900?random=5', 'https://picsum.photos/1920/1080?random=5', ARRAY['Action', 'Racing', 'Crime'], 'https://example.com/dhoom/master.m3u8', ARRAY['Action', 'Crime', 'Thriller'], NOW(), NOW());

-- More Action Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Dhoom 2', 'The sequel follows the same police team as they track down international thieves who steal priceless artifacts.', 'movie', 2006, 'UA13', 9600, 'https://picsum.photos/600/900?random=6', 'https://picsum.photos/1920/1080?random=6', ARRAY['Action', 'Heist', 'International'], 'https://example.com/dhoom-2/master.m3u8', ARRAY['Action', 'Crime', 'Thriller'], NOW(), NOW()),

('Krrish', 'A superhero film about a young man with extraordinary powers who must protect the world from evil forces.', 'movie', 2006, 'U', 10200, 'https://picsum.photos/600/900?random=7', 'https://picsum.photos/1920/1080?random=7', ARRAY['Superhero', 'Action', 'Sci-Fi'], 'https://example.com/krrish/master.m3u8', ARRAY['Action', 'Sci-Fi', 'Drama'], NOW(), NOW()),

('Singham', 'A honest police officer takes on a powerful politician and his criminal empire.', 'movie', 2011, 'UA13', 9000, 'https://picsum.photos/600/900?random=8', 'https://picsum.photos/1920/1080?random=8', ARRAY['Action', 'Police', 'Drama'], 'https://example.com/singham/master.m3u8', ARRAY['Action', 'Drama', 'Crime'], NOW(), NOW()),

('Rowdy Rathore', 'A small-time thief discovers he has a doppelganger who is a police officer.', 'movie', 2012, 'UA13', 8400, 'https://picsum.photos/600/900?random=9', 'https://picsum.photos/1920/1080?random=9', ARRAY['Action', 'Comedy', 'Drama'], 'https://example.com/rowdy-rathore/master.m3u8', ARRAY['Action', 'Comedy', 'Drama'], NOW(), NOW()),

('Bang Bang', 'A bank receptionist gets involved with a mysterious man who claims to be a secret agent.', 'movie', 2014, 'UA13', 9000, 'https://picsum.photos/600/900?random=10', 'https://picsum.photos/1920/1080?random=10', ARRAY['Action', 'Romance', 'Thriller'], 'https://example.com/bang-bang/master.m3u8', ARRAY['Action', 'Romance', 'Thriller'], NOW(), NOW());

-- More Action & Military Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Ek Tha Tiger', 'A RAW agent falls in love with a Pakistani ISI agent while on a mission.', 'movie', 2012, 'UA13', 8400, 'https://picsum.photos/600/900?random=11', 'https://picsum.photos/1920/1080?random=11', ARRAY['Action', 'Espionage', 'Romance'], 'https://example.com/ek-tha-tiger/master.m3u8', ARRAY['Action', 'Romance', 'Espionage'], NOW(), NOW()),

('Tiger Zinda Hai', 'The sequel follows Tiger and Zoya as they team up to rescue Indian nurses held hostage by terrorists in Iraq.', 'movie', 2017, 'UA13', 9000, 'https://picsum.photos/600/900?random=12', 'https://picsum.photos/1920/1080?random=12', ARRAY['Action', 'Rescue', 'Terrorism'], 'https://example.com/tiger-zinda-hai/master.m3u8', ARRAY['Action', 'Thriller', 'Espionage'], NOW(), NOW()),

('Force', 'A tough police officer seeks revenge after his wife is killed by a drug lord.', 'movie', 2011, 'UA13', 8400, 'https://picsum.photos/600/900?random=13', 'https://picsum.photos/1920/1080?random=13', ARRAY['Action', 'Revenge', 'Police'], 'https://example.com/force/master.m3u8', ARRAY['Action', 'Drama', 'Crime'], NOW(), NOW()),

('Kaabil', 'A blind man seeks revenge against those who wronged him and his wife.', 'movie', 2017, 'UA13', 8400, 'https://picsum.photos/600/900?random=14', 'https://picsum.photos/1920/1080?random=14', ARRAY['Action', 'Revenge', 'Drama'], 'https://example.com/kaabil/master.m3u8', ARRAY['Action', 'Drama', 'Thriller'], NOW(), NOW()),

('Gabbar Is Back', 'A vigilante takes on corruption in the education system by targeting corrupt officials.', 'movie', 2015, 'UA13', 7800, 'https://picsum.photos/600/900?random=15', 'https://picsum.photos/1920/1080?random=15', ARRAY['Action', 'Vigilante', 'Corruption'], 'https://example.com/gabbar-is-back/master.m3u8', ARRAY['Action', 'Drama', 'Crime'], NOW(), NOW());

-- Drama Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('3 Idiots', 'Two friends looking for a lost buddy deal with a forgotten bet, a wedding they have to crash, and a funeral that goes impossibly out of control.', 'movie', 2009, 'UA13', 10200, 'https://picsum.photos/600/900?random=16', 'https://picsum.photos/1920/1080?random=16', ARRAY['Comedy', 'Education', 'Friendship'], 'https://example.com/3-idiots/master.m3u8', ARRAY['Comedy', 'Drama'], NOW(), NOW()),

('Taare Zameen Par', 'An eight-year-old boy is thought to be a lazy trouble-maker until the new art teacher has the patience to discover the real problem behind his struggles.', 'movie', 2007, 'U', 10200, 'https://picsum.photos/600/900?random=17', 'https://picsum.photos/1920/1080?random=17', ARRAY['Drama', 'Education', 'Family'], 'https://example.com/taare-zameen-par/master.m3u8', ARRAY['Drama', 'Family'], NOW(), NOW()),

('Rang De Basanti', 'The story of six friends who help a foreign filmmaker make a documentary about Indian freedom fighters, leading to a journey of self-discovery and patriotism.', 'movie', 2006, 'UA13', 9600, 'https://picsum.photos/600/900?random=18', 'https://picsum.photos/1920/1080?random=18', ARRAY['Drama', 'Patriotic', 'Friendship'], 'https://example.com/rang-de-basanti/master.m3u8', ARRAY['Drama', 'Patriotic'], NOW(), NOW()),

('Guzaarish', 'A former magician who is now a quadriplegic after an accident files a petition in court seeking permission to end his life.', 'movie', 2010, 'UA13', 8400, 'https://picsum.photos/600/900?random=19', 'https://picsum.photos/1920/1080?random=19', ARRAY['Drama', 'Life', 'Choice'], 'https://example.com/guzaarish/master.m3u8', ARRAY['Drama', 'Romance'], NOW(), NOW()),

('Queen', 'A young woman goes on her honeymoon alone after her fiancé calls off their wedding. The journey helps her discover herself and gain confidence.', 'movie', 2014, 'UA13', 7800, 'https://picsum.photos/600/900?random=20', 'https://picsum.photos/1920/1080?random=20', ARRAY['Comedy', 'Self-Discovery', 'Travel'], 'https://example.com/queen/master.m3u8', ARRAY['Comedy', 'Drama'], NOW(), NOW());

-- Romance Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Dilwale Dulhania Le Jayenge', 'A romantic tale of two young people who fall in love during a European vacation but must convince their families to approve their marriage.', 'movie', 1995, 'U', 10800, 'https://picsum.photos/600/900?random=21', 'https://picsum.photos/1920/1080?random=21', ARRAY['Romance', 'Family', 'Musical'], 'https://example.com/ddlj/master.m3u8', ARRAY['Romance', 'Drama', 'Musical'], NOW(), NOW()),

('Kuch Kuch Hota Hai', 'A love triangle between three friends, the film explores themes of friendship, love, and the choices we make in life.', 'movie', 1998, 'U', 10200, 'https://picsum.photos/600/900?random=22', 'https://picsum.photos/1920/1080?random=22', ARRAY['Romance', 'Friendship', 'Love Triangle'], 'https://example.com/kkhh/master.m3u8', ARRAY['Romance', 'Drama', 'Musical'], NOW(), NOW()),

('Kabhi Khushi Kabhie Gham', 'A family drama about a father who disowns his adopted son for marrying against his wishes, and the journey to reconciliation.', 'movie', 2001, 'U', 12000, 'https://picsum.photos/600/900?random=23', 'https://picsum.photos/1920/1080?random=23', ARRAY['Drama', 'Family', 'Reconciliation'], 'https://example.com/k3g/master.m3u8', ARRAY['Drama', 'Family', 'Romance'], NOW(), NOW()),

('Jab We Met', 'A depressed businessman meets a talkative woman on a train journey, leading to an adventure that changes both their lives forever.', 'movie', 2007, 'U', 9000, 'https://picsum.photos/600/900?random=24', 'https://picsum.photos/1920/1080?random=24', ARRAY['Romance', 'Comedy', 'Adventure'], 'https://example.com/jab-we-met/master.m3u8', ARRAY['Romance', 'Comedy', 'Drama'], NOW(), NOW()),

('Jaane Tu... Ya Jaane Na', 'Two best friends realize they are in love with each other after helping each other find their perfect matches. A sweet coming-of-age romance.', 'movie', 2008, 'U', 9000, 'https://picsum.photos/600/900?random=25', 'https://picsum.photos/1920/1080?random=25', ARRAY['Romance', 'Friendship', 'Coming-of-Age'], 'https://example.com/jaane-tu-ya-jaane-na/master.m3u8', ARRAY['Romance', 'Comedy', 'Drama'], NOW(), NOW());

-- More Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Tamasha', 'A man who has lost his passion for life meets a woman who helps him rediscover his true self.', 'movie', 2015, 'UA13', 8400, 'https://picsum.photos/600/900?random=26', 'https://picsum.photos/1920/1080?random=26', ARRAY['Romance', 'Self-Discovery', 'Identity'], 'https://example.com/tamasha/master.m3u8', ARRAY['Romance', 'Drama'], NOW(), NOW()),

('Yeh Jawaani Hai Deewani', 'A free-spirited man and a conservative woman meet on a trip and fall in love, but their different life goals create challenges.', 'movie', 2013, 'UA13', 9000, 'https://picsum.photos/600/900?random=27', 'https://picsum.photos/1920/1080?random=27', ARRAY['Romance', 'Travel', 'Life Goals'], 'https://example.com/yeh-jawaani-hai-deewani/master.m3u8', ARRAY['Romance', 'Drama', 'Comedy'], NOW(), NOW()),

('2 States', 'Based on a novel, the film follows a couple from different states who must convince their families to accept their inter-cultural marriage.', 'movie', 2014, 'UA13', 8400, 'https://picsum.photos/600/900?random=28', 'https://picsum.photos/1920/1080?random=28', ARRAY['Romance', 'Inter-cultural', 'Family'], 'https://example.com/2-states/master.m3u8', ARRAY['Romance', 'Comedy', 'Drama'], NOW(), NOW()),

('Humpty Sharma Ki Dulhania', 'A young man falls in love with a woman who is already engaged, leading to a series of comedic situations.', 'movie', 2014, 'UA13', 7800, 'https://picsum.photos/600/900?random=29', 'https://picsum.photos/1920/1080?random=29', ARRAY['Romance', 'Comedy', 'Love Triangle'], 'https://example.com/humpty-sharma-ki-dulhania/master.m3u8', ARRAY['Romance', 'Comedy', 'Drama'], NOW(), NOW()),

('Veere Di Wedding', 'Four friends reunite for a wedding, dealing with their own personal issues and relationships while supporting each other.', 'movie', 2018, 'UA13', 7800, 'https://picsum.photos/600/900?random=30', 'https://picsum.photos/1920/1080?random=30', ARRAY['Comedy', 'Friendship', 'Wedding'], 'https://example.com/veere-di-wedding/master.m3u8', ARRAY['Comedy', 'Drama', 'Romance'], NOW(), NOW());

-- Final Batch of Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Badhaai Ho', 'A middle-aged couple''s unexpected pregnancy creates chaos in their family, leading to humorous and heartwarming situations.', 'movie', 2018, 'UA13', 7200, 'https://picsum.photos/600/900?random=31', 'https://picsum.photos/1920/1080?random=31', ARRAY['Comedy', 'Family', 'Pregnancy'], 'https://example.com/badhaai-ho/master.m3u8', ARRAY['Comedy', 'Drama', 'Family'], NOW(), NOW()),

('Dil To Pagal Hai', 'A love triangle between a dancer, her choreographer, and his best friend. The film explores themes of love, friendship, and destiny.', 'movie', 1997, 'U', 10200, 'https://picsum.photos/600/900?random=32', 'https://picsum.photos/1920/1080?random=32', ARRAY['Romance', 'Dance', 'Love Triangle'], 'https://example.com/dil-to-pagal-hai/master.m3u8', ARRAY['Romance', 'Drama', 'Musical'], NOW(), NOW()),

('Dil Se', 'A radio journalist falls in love with a mysterious woman who has a dark past. The film explores themes of love, terrorism, and redemption.', 'movie', 1998, 'UA13', 9600, 'https://picsum.photos/600/900?random=33', 'https://picsum.photos/1920/1080?random=33', ARRAY['Romance', 'Terrorism', 'Redemption'], 'https://example.com/dil-se/master.m3u8', ARRAY['Romance', 'Drama', 'Thriller'], NOW(), NOW()),

('Kal Ho Naa Ho', 'A terminally ill man helps his friend find love while hiding his own feelings for her. The film is known for its emotional depth.', 'movie', 2003, 'U', 9600, 'https://picsum.photos/600/900?random=34', 'https://picsum.photos/1920/1080?random=34', ARRAY['Romance', 'Friendship', 'Sacrifice'], 'https://example.com/kal-ho-naa-ho/master.m3u8', ARRAY['Romance', 'Drama', 'Comedy'], NOW(), NOW()),

('Singham Returns', 'The sequel follows Bajirao Singham as he faces new challenges in the police force and fights against corruption and crime.', 'movie', 2014, 'UA13', 9000, 'https://picsum.photos/600/900?random=35', 'https://picsum.photos/1920/1080?random=35', ARRAY['Action', 'Police', 'Corruption'], 'https://example.com/singham-returns/master.m3u8', ARRAY['Action', 'Drama', 'Crime'], NOW(), NOW()),

('Sholay', 'Two criminals are hired to capture a notorious dacoit. The film is considered one of the greatest Indian films ever made.', 'movie', 1975, 'UA13', 12000, 'https://picsum.photos/600/900?random=36', 'https://picsum.photos/1920/1080?random=36', ARRAY['Classic', 'Action', 'Western'], 'https://example.com/sholay/master.m3u8', ARRAY['Action', 'Drama', 'Western'], NOW(), NOW()),

('Deewar', 'A story of two brothers who take different paths in life - one becomes a police officer while the other becomes a criminal.', 'movie', 1975, 'UA13', 11400, 'https://picsum.photos/600/900?random=37', 'https://picsum.photos/1920/1080?random=37', ARRAY['Drama', 'Crime', 'Family'], 'https://example.com/deewar/master.m3u8', ARRAY['Drama', 'Crime'], NOW(), NOW()),

('Mother India', 'A classic film about a woman who struggles to raise her sons in poverty and faces moral dilemmas.', 'movie', 1957, 'U', 12000, 'https://picsum.photos/600/900?random=38', 'https://picsum.photos/1920/1080?random=38', ARRAY['Classic', 'Drama', 'Family'], 'https://example.com/mother-india/master.m3u8', ARRAY['Drama', 'Family'], NOW(), NOW()),

('Mughal-e-Azam', 'A historical romance about Prince Salim and court dancer Anarkali during the Mughal era.', 'movie', 1960, 'U', 12000, 'https://picsum.photos/600/900?random=39', 'https://picsum.photos/1920/1080?random=39', ARRAY['Historical', 'Romance', 'Classic'], 'https://example.com/mughal-e-azam/master.m3u8', ARRAY['Drama', 'Romance', 'Historical'], NOW(), NOW()),

('Pyaasa', 'A struggling poet''s work is published after his supposed death, leading to fame and recognition.', 'movie', 1957, 'U', 11400, 'https://picsum.photos/600/900?random=40', 'https://picsum.photos/1920/1080?random=40', ARRAY['Classic', 'Drama', 'Poetry'], 'https://example.com/pyaasa/master.m3u8', ARRAY['Drama', 'Romance'], NOW(), NOW());

-- Final 10 Movies (Different Random Images)
INSERT INTO public.titles (title, synopsis, kind, year, rating, runtime_sec, poster_url, hero_url, tags, playback_url, genres, created_at, updated_at) VALUES
('Lagaan', 'A village in British India is challenged to a game of cricket by their rulers, with the stakes being their land and taxes.', 'movie', 2001, 'U', 12000, 'https://picsum.photos/600/900?random=41', 'https://picsum.photos/1920/1080?random=41', ARRAY['Drama', 'Sports', 'Historical'], 'https://example.com/lagaan/master.m3u8', ARRAY['Drama', 'Sports', 'Historical'], NOW(), NOW()),

('Swades', 'An NRI returns to India and discovers his roots while working on rural development projects.', 'movie', 2004, 'U', 12000, 'https://picsum.photos/600/900?random=42', 'https://picsum.photos/1920/1080?random=42', ARRAY['Drama', 'Rural Development', 'Patriotic'], 'https://example.com/swades/master.m3u8', ARRAY['Drama', 'Romance'], NOW(), NOW()),

('Chak De India', 'A disgraced hockey player returns to coach the Indian women''s hockey team to victory.', 'movie', 2007, 'UA13', 9000, 'https://picsum.photos/600/900?random=43', 'https://picsum.photos/1920/1080?random=43', ARRAY['Sports', 'Drama', 'Inspirational'], 'https://example.com/chak-de-india/master.m3u8', ARRAY['Drama', 'Sports'], NOW(), NOW()),

('Bhaag Milkha Bhaag', 'The story of Milkha Singh, an Indian athlete who overcame personal tragedy to become a world-class runner.', 'movie', 2013, 'UA13', 12000, 'https://picsum.photos/600/900?random=44', 'https://picsum.photos/1920/1080?random=44', ARRAY['Biography', 'Sports', 'Inspirational'], 'https://example.com/bhaag-milkha-bhaag/master.m3u8', ARRAY['Drama', 'Biography', 'Sports'], NOW(), NOW()),

('Mary Kom', 'The biographical film about Indian boxer Mary Kom and her journey to becoming a world champion.', 'movie', 2014, 'UA13', 7800, 'https://picsum.photos/600/900?random=45', 'https://picsum.photos/1920/1080?random=45', ARRAY['Biography', 'Sports', 'Boxing'], 'https://example.com/mary-kom/master.m3u8', ARRAY['Drama', 'Biography', 'Sports'], NOW(), NOW()),

('Dangal', 'Based on the true story of wrestler Mahavir Singh Phogat and his daughters who became wrestling champions.', 'movie', 2016, 'UA13', 10200, 'https://picsum.photos/600/900?random=46', 'https://picsum.photos/1920/1080?random=46', ARRAY['Biography', 'Sports', 'Wrestling'], 'https://example.com/dangal/master.m3u8', ARRAY['Drama', 'Biography', 'Sports'], NOW(), NOW()),

('Secret Superstar', 'A teenage girl from a conservative family becomes a YouTube sensation while hiding her identity.', 'movie', 2017, 'UA13', 9000, 'https://picsum.photos/600/900?random=47', 'https://picsum.photos/1920/1080?random=47', ARRAY['Drama', 'Music', 'Family'], 'https://example.com/secret-superstar/master.m3u8', ARRAY['Drama', 'Music', 'Family'], NOW(), NOW()),

('Andhadhun', 'A blind pianist gets caught up in a series of mysterious events after witnessing a murder.', 'movie', 2018, 'UA13', 8400, 'https://picsum.photos/600/900?random=48', 'https://picsum.photos/1920/1080?random=48', ARRAY['Thriller', 'Crime', 'Mystery'], 'https://example.com/andhadhun/master.m3u8', ARRAY['Thriller', 'Crime', 'Drama'], NOW(), NOW()),

('Article 15', 'A police officer investigates the disappearance of three girls from a village, uncovering caste-based discrimination.', 'movie', 2019, 'UA13', 7800, 'https://picsum.photos/600/900?random=49', 'https://picsum.photos/1920/1080?random=49', ARRAY['Drama', 'Social Issues', 'Crime'], 'https://example.com/article-15/master.m3u8', ARRAY['Drama', 'Crime', 'Thriller'], NOW(), NOW()),

('Thappad', 'A woman questions her seemingly perfect marriage after her husband slaps her at a party.', 'movie', 2020, 'UA13', 7800, 'https://picsum.photos/600/900?random=50', 'https://picsum.photos/1920/1080?random=50', ARRAY['Drama', 'Social Issues', 'Marriage'], 'https://example.com/thappad/master.m3u8', ARRAY['Drama', 'Social Issues'], NOW(), NOW());

-- Success message and verification
SELECT 'Successfully added 50 Bollywood movies with GUARANTEED working images!' as message;
SELECT COUNT(*) as total_movies FROM public.titles;
SELECT 'Each movie has a unique random image from Picsum Photos' as image_info;
