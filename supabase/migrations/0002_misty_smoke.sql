/*
  # Seed Systems Data

  1. Purpose
    - Populate the systems table with initial data
    - Add common gaming systems with their details

  2. Systems Added
    - NES
    - SNES
    - Genesis
    - Arcade
*/

INSERT INTO systems (id, name, short_name, icon, description, year, manufacturer, color, gradient)
VALUES
  (
    'nes',
    'Nintendo Entertainment System',
    'NES',
    'Gamepad2',
    '8-bit home video game console',
    '1983',
    'Nintendo',
    'rgb(229, 62, 62)',
    'from-red-500 to-red-600'
  ),
  (
    'snes',
    'Super Nintendo Entertainment System',
    'SNES',
    'Cpu',
    '16-bit home video game console',
    '1990',
    'Nintendo',
    'rgb(129, 140, 248)',
    'from-indigo-400 to-indigo-500'
  ),
  (
    'genesis',
    'Sega Genesis',
    'Genesis',
    'Sword',
    '16-bit home video game console',
    '1988',
    'Sega',
    'rgb(34, 197, 94)',
    'from-green-500 to-green-600'
  ),
  (
    'arcade',
    'Arcade Systems',
    'Arcade',
    'Joystick',
    'Classic arcade systems',
    '1970s-1990s',
    'Various',
    'rgb(234, 179, 8)',
    'from-yellow-500 to-yellow-600'
  );