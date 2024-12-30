/*
  # Add Additional MiSTer FPGA Cores

  1. New Systems
    - Adds more computer and console systems
    - Includes manufacturer and release year information

  2. New Cores
    - Adds arcade game cores
    - Adds computer system cores
    - Adds console cores

  3. Changes
    - Preserves existing data with ON CONFLICT clauses
    - Batches inserts for better performance
*/

BEGIN;

-- Add more systems
DO $$
BEGIN
  INSERT INTO systems (id, name, short_name, icon, description, year, manufacturer)
  VALUES
    ('amiga', 'Commodore Amiga', 'Amiga', 'Cpu', '16/32-bit home computer', '1985', 'Commodore'),
    ('ao486', '486 PC Compatible', '486', 'Cpu', 'x86 PC Compatible System', '1989', 'Various'),
    ('atari800', 'Atari 800', 'A800', 'Cpu', '8-bit home computer', '1979', 'Atari'),
    ('atari5200', 'Atari 5200', '5200', 'Gamepad2', '8-bit home video game console', '1982', 'Atari'),
    ('atari7800', 'Atari 7800', '7800', 'Gamepad2', '8-bit home video game console', '1986', 'Atari'),
    ('coleco', 'ColecoVision', 'CV', 'Gamepad2', '8-bit home video game console', '1982', 'Coleco'),
    ('msx', 'MSX', 'MSX', 'Cpu', '8-bit home computer standard', '1983', 'Microsoft/ASCII'),
    ('odyssey2', 'Magnavox Odyssey²', 'O2', 'Gamepad2', '8-bit home video game console', '1978', 'Magnavox'),
    ('sg1000', 'Sega SG-1000', 'SG-1000', 'Gamepad2', '8-bit home video game console', '1983', 'Sega'),
    ('tg16', 'TurboGrafx-16', 'TG16', 'Gamepad2', '16-bit home video game console', '1987', 'NEC'),
    ('vic20', 'Commodore VIC-20', 'VIC-20', 'Cpu', '8-bit home computer', '1980', 'Commodore'),
    ('x68000', 'Sharp X68000', 'X68k', 'Cpu', '16/32-bit home computer', '1987', 'Sharp')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Add more cores in batches
DO $$
BEGIN
  -- Arcade cores batch 1
  INSERT INTO system_cores (system_id, name, filename, description, version)
  SELECT 
    s.id,
    c.name,
    c.filename,
    c.description,
    c.version
  FROM (
    VALUES
      ('arcade', 'Altered Beast', 'altbeast.rbf', 'Sega System 16 arcade game from 1988', '1.0.0'),
      ('arcade', 'Asteroids', 'asteroids.rbf', 'Atari arcade game from 1979', '1.0.0'),
      ('arcade', 'Bubble Bobble', 'bubbobble.rbf', 'Taito arcade game from 1986', '1.0.0'),
      ('arcade', 'Dig Dug', 'digdug.rbf', 'Namco arcade game from 1982', '1.0.0')
    ) AS c(system_id, name, filename, description, version)
    JOIN systems s ON s.id = c.system_id
  ON CONFLICT (system_id, filename) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = now();

  -- Computer cores batch
  INSERT INTO system_cores (system_id, name, filename, description, version)
  SELECT 
    s.id,
    c.name,
    c.filename,
    c.description,
    c.version
  FROM (
    VALUES
      ('amiga', 'Amiga 500/1200', 'Amiga.rbf', 'Commodore Amiga computer core', '1.0.0'),
      ('ao486', '486 PC', 'ao486.rbf', 'x86 PC compatible core', '1.0.0'),
      ('msx', 'MSX/MSX2', 'MSX.rbf', 'MSX computer standard core', '1.0.0'),
      ('x68000', 'Sharp X68000', 'X68000.rbf', 'Sharp X68000 computer core', '1.0.0')
    ) AS c(system_id, name, filename, description, version)
    JOIN systems s ON s.id = c.system_id
  ON CONFLICT (system_id, filename) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = now();

  -- Console cores batch
  INSERT INTO system_cores (system_id, name, filename, description, version)
  SELECT 
    s.id,
    c.name,
    c.filename,
    c.description,
    c.version
  FROM (
    VALUES
      ('atari5200', 'Atari 5200', 'Atari5200.rbf', 'Atari 5200 console core', '1.0.0'),
      ('atari7800', 'Atari 7800', 'Atari7800.rbf', 'Atari 7800 console core', '1.0.0'),
      ('coleco', 'ColecoVision', 'ColecoVision.rbf', 'ColecoVision console core', '1.0.0'),
      ('odyssey2', 'Odyssey²', 'Odyssey2.rbf', 'Magnavox Odyssey² console core', '1.0.0'),
      ('sg1000', 'SG-1000', 'SG1000.rbf', 'Sega SG-1000 console core', '1.0.0'),
      ('tg16', 'TurboGrafx-16', 'TurboGrafx16.rbf', 'NEC TurboGrafx-16 console core', '1.0.0')
    ) AS c(system_id, name, filename, description, version)
    JOIN systems s ON s.id = c.system_id
  ON CONFLICT (system_id, filename) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    version = EXCLUDED.version,
    updated_at = now();
END $$;

COMMIT;