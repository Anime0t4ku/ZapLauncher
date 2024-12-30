/*
  # Add mock games for testing

  1. New Data
    - Adds mock games for each system with realistic metadata
    - Includes titles, descriptions, release years, developers, and genres
    - Sets cover images using Unsplash photos
*/

-- Insert mock games for various systems
INSERT INTO games (
  id,
  title,
  system_id,
  path,
  description,
  release_year,
  developer,
  genre,
  cover_url,
  user_id,
  favorite
) VALUES
  -- NES Games
  (
    gen_random_uuid(),
    'Super Mario Bros. 3',
    'nes',
    '/games/nes/smb3.nes',
    'One of the most beloved platformers of all time, featuring innovative level design and power-ups.',
    '1988',
    'Nintendo',
    'Platformer',
    'https://images.unsplash.com/photo-1591631368887-e9474b072591',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'The Legend of Zelda',
    'nes',
    '/games/nes/zelda.nes',
    'The first entry in the legendary action-adventure series.',
    '1986',
    'Nintendo',
    'Action-Adventure',
    'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4',
    '11111111-1111-1111-1111-111111111111',
    false
  ),
  
  -- SNES Games
  (
    gen_random_uuid(),
    'Chrono Trigger',
    'snes',
    '/games/snes/chronotrigger.sfc',
    'A groundbreaking RPG about time travel and saving the world.',
    '1995',
    'Square',
    'RPG',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'Super Metroid',
    'snes',
    '/games/snes/supermetroid.sfc',
    'The definitive 2D Metroid experience with atmospheric exploration.',
    '1994',
    'Nintendo',
    'Action-Adventure',
    'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
    '11111111-1111-1111-1111-111111111111',
    false
  ),

  -- Genesis Games
  (
    gen_random_uuid(),
    'Sonic the Hedgehog 2',
    'genesis',
    '/games/genesis/sonic2.md',
    'The blue blur returns with his new friend Tails in this fast-paced platformer.',
    '1992',
    'Sega',
    'Platformer',
    'https://images.unsplash.com/photo-1566577134665-2c674085abf7',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'Streets of Rage 2',
    'genesis',
    '/games/genesis/sor2.md',
    'The ultimate 16-bit beat-em-up with amazing music and gameplay.',
    '1992',
    'Sega',
    'Beat-em-up',
    'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
    '11111111-1111-1111-1111-111111111111',
    false
  ),

  -- Arcade Games
  (
    gen_random_uuid(),
    'Street Fighter II',
    'arcade',
    '/games/arcade/sf2.zip',
    'The fighting game that started a revolution in arcades worldwide.',
    '1991',
    'Capcom',
    'Fighting',
    'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'Pac-Man',
    'arcade',
    '/games/arcade/pacman.zip',
    'The iconic maze chase game that defined a generation.',
    '1980',
    'Namco',
    'Maze',
    'https://images.unsplash.com/photo-1579309401389-a2476dddf3d4',
    '11111111-1111-1111-1111-111111111111',
    false
  ),

  -- Amiga Games
  (
    gen_random_uuid(),
    'Another World',
    'amiga',
    '/games/amiga/anotherworld.adf',
    'A cinematic platformer with rotoscoped animation and unique atmosphere.',
    '1991',
    'Delphine Software',
    'Cinematic Platformer',
    'https://images.unsplash.com/photo-1569867034714-a66f345689d9',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'Turrican II',
    'amiga',
    '/games/amiga/turrican2.adf',
    'A masterpiece of action platforming with incredible music.',
    '1991',
    'Rainbow Arts',
    'Run and Gun',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    '11111111-1111-1111-1111-111111111111',
    false
  ),

  -- MSX Games
  (
    gen_random_uuid(),
    'Metal Gear',
    'msx',
    '/games/msx/metalgear.rom',
    'Hideo Kojima''s stealth action game that started the Metal Gear series.',
    '1987',
    'Konami',
    'Action-Adventure',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
    '11111111-1111-1111-1111-111111111111',
    true
  ),
  (
    gen_random_uuid(),
    'Vampire Killer',
    'msx',
    '/games/msx/vampirekiller.rom',
    'The MSX version of Castlevania with unique gameplay mechanics.',
    '1986',
    'Konami',
    'Platform-Adventure',
    'https://images.unsplash.com/photo-1551103782-8ab07afd45c1',
    '11111111-1111-1111-1111-111111111111',
    false
  );

-- Set some games as recently played
UPDATE games
SET last_played = now() - (random() * interval '7 days')
WHERE random() < 0.5;