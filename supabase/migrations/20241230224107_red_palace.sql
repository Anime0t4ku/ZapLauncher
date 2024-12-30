/*
  # Add System Cores

  1. New Data
    - Add cores for NES, SNES, Genesis, and Arcade systems
    - Each core includes name, filename, description, and version

  2. Organization
    - Cores are grouped by system
    - Each core has proper metadata
*/

-- Insert cores for NES
INSERT INTO system_cores (system_id, name, filename, description, version)
VALUES
  ('nes', 'NES', 'NES.rbf', 'Nintendo Entertainment System core with full compatibility', '1.0.0'),
  ('nes', 'NES_FDS', 'NES_FDS.rbf', 'NES with Famicom Disk System support', '1.0.0'),
  ('nes', 'NES_NORAM', 'NES_NORAM.rbf', 'NES core without extra RAM for certain games', '1.0.0');

-- Insert cores for SNES
INSERT INTO system_cores (system_id, name, filename, description, version)
VALUES
  ('snes', 'SNES', 'SNES.rbf', 'Super Nintendo Entertainment System core', '1.0.0'),
  ('snes', 'SNES_FAST', 'SNES_FAST.rbf', 'Optimized SNES core for better performance', '1.0.0'),
  ('snes', 'SNES_MSU', 'SNES_MSU.rbf', 'SNES core with MSU-1 audio enhancement support', '1.0.0');

-- Insert cores for Genesis
INSERT INTO system_cores (system_id, name, filename, description, version)
VALUES
  ('genesis', 'Genesis', 'Genesis.rbf', 'Sega Genesis/Mega Drive core', '1.0.0'),
  ('genesis', 'Genesis_WIDE', 'Genesis_WIDE.rbf', 'Genesis core with widescreen support', '1.0.0'),
  ('genesis', 'Genesis_32X', 'Genesis_32X.rbf', 'Genesis core with 32X support', '1.0.0'),
  ('genesis', 'Genesis_CD', 'Genesis_CD.rbf', 'Genesis core with CD support', '1.0.0');

-- Insert cores for Arcade systems
INSERT INTO system_cores (system_id, name, filename, description, version)
VALUES
  -- Capcom CPS1
  ('arcade', 'CPS1', 'CPS1.rbf', 'Capcom Play System 1 arcade core', '1.0.0'),
  ('arcade', 'CPS2', 'CPS2.rbf', 'Capcom Play System 2 arcade core', '1.0.0'),
  ('arcade', 'CPS3', 'CPS3.rbf', 'Capcom Play System 3 arcade core', '1.0.0'),
  
  -- Neo Geo
  ('arcade', 'NeoGeo', 'NeoGeo.rbf', 'SNK Neo Geo AES/MVS arcade core', '1.0.0'),
  
  -- Konami
  ('arcade', 'Contra', 'Contra.rbf', 'Konami Contra arcade hardware', '1.0.0'),
  ('arcade', 'TMNT', 'TMNT.rbf', 'Konami TMNT arcade hardware', '1.0.0'),
  ('arcade', 'GX400', 'GX400.rbf', 'Konami GX400 arcade hardware', '1.0.0'),
  
  -- Sega
  ('arcade', 'System16', 'System16.rbf', 'Sega System 16 arcade core', '1.0.0'),
  ('arcade', 'System1', 'System1.rbf', 'Sega System 1 arcade core', '1.0.0'),
  ('arcade', 'OutRun', 'OutRun.rbf', 'Sega OutRun arcade hardware', '1.0.0'),
  
  -- Namco
  ('arcade', 'Galaga', 'Galaga.rbf', 'Namco Galaga arcade hardware', '1.0.0'),
  ('arcade', 'PacMan', 'PacMan.rbf', 'Namco Pac-Man arcade hardware', '1.0.0'),
  ('arcade', 'DigDug', 'DigDug.rbf', 'Namco Dig Dug arcade hardware', '1.0.0'),
  
  -- Atari
  ('arcade', 'Asteroids', 'Asteroids.rbf', 'Atari Asteroids arcade hardware', '1.0.0'),
  ('arcade', 'Centipede', 'Centipede.rbf', 'Atari Centipede arcade hardware', '1.0.0'),
  ('arcade', 'Tempest', 'Tempest.rbf', 'Atari Tempest arcade hardware', '1.0.0')
ON CONFLICT (system_id, filename) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  version = EXCLUDED.version,
  updated_at = now();