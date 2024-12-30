/*
  # Add More MiSTer FPGA Systems

  1. New Systems
    - Add more computer systems (Amiga, Atari ST, etc.)
    - Add more console systems (TurboGrafx-16, Neo Geo, etc.)
    - Add more handheld systems (Game Boy, Game Gear, etc.)

  2. Organization
    - Systems grouped by type (Computer, Console, Handheld)
    - Each system includes proper metadata
*/

-- Insert additional computer systems
INSERT INTO systems (id, name, short_name, icon, description, year, manufacturer, gradient)
VALUES
  -- Home Computers
  ('amiga', 'Commodore Amiga', 'Amiga', 'Cpu', '16/32-bit home computer with advanced graphics and sound', '1985', 'Commodore', 'from-purple-500 to-purple-600'),
  ('atari_st', 'Atari ST', 'ST', 'Cpu', '16/32-bit home computer', '1985', 'Atari', 'from-green-400 to-green-500'),
  ('c64', 'Commodore 64', 'C64', 'Cpu', '8-bit home computer', '1982', 'Commodore', 'from-blue-500 to-blue-600'),
  ('zx_spectrum', 'ZX Spectrum', 'Spectrum', 'Cpu', '8-bit home computer', '1982', 'Sinclair', 'from-red-400 to-red-500'),
  ('msx', 'MSX', 'MSX', 'Cpu', '8-bit home computer standard', '1983', 'Various', 'from-yellow-500 to-yellow-600'),
  ('apple2', 'Apple II', 'Apple II', 'Cpu', '8-bit home computer', '1977', 'Apple', 'from-gray-500 to-gray-600'),
  ('ao486', '486 PC', '486', 'Cpu', 'x86 PC Compatible System', '1989', 'Various', 'from-blue-600 to-blue-700'),
  ('x68000', 'Sharp X68000', 'X68k', 'Cpu', '16/32-bit home computer', '1987', 'Sharp', 'from-red-600 to-red-700'),

  -- Additional Consoles
  ('tg16', 'TurboGrafx-16', 'TG16', 'Gamepad2', '16-bit home video game console', '1987', 'NEC', 'from-orange-500 to-orange-600'),
  ('pcengine_cd', 'PC Engine CD', 'PCE-CD', 'Gamepad2', 'CD-ROM add-on for PC Engine', '1988', 'NEC', 'from-orange-400 to-orange-500'),
  ('neogeo', 'Neo Geo AES', 'Neo Geo', 'Gamepad2', '24-bit home video game console', '1990', 'SNK', 'from-yellow-600 to-yellow-700'),
  ('master_system', 'Sega Master System', 'SMS', 'Gamepad2', '8-bit home video game console', '1985', 'Sega', 'from-blue-500 to-blue-600'),
  ('atari2600', 'Atari 2600', '2600', 'Gamepad2', '8-bit home video game console', '1977', 'Atari', 'from-brown-500 to-brown-600'),
  ('atari5200', 'Atari 5200', '5200', 'Gamepad2', '8-bit home video game console', '1982', 'Atari', 'from-brown-400 to-brown-500'),
  ('atari7800', 'Atari 7800', '7800', 'Gamepad2', '8-bit home video game console', '1986', 'Atari', 'from-brown-600 to-brown-700'),
  ('colecovision', 'ColecoVision', 'CV', 'Gamepad2', '8-bit home video game console', '1982', 'Coleco', 'from-purple-400 to-purple-500'),
  ('intellivision', 'Intellivision', 'INTV', 'Gamepad2', '16-bit home video game console', '1979', 'Mattel', 'from-red-500 to-red-600'),
  ('vectrex', 'Vectrex', 'Vectrex', 'Gamepad2', 'Vector-based home video game console', '1982', 'GCE', 'from-gray-600 to-gray-700'),

  -- Handheld Systems
  ('gameboy', 'Game Boy', 'GB', 'Gamepad2', '8-bit handheld game console', '1989', 'Nintendo', 'from-green-500 to-green-600'),
  ('gbc', 'Game Boy Color', 'GBC', 'Gamepad2', '8-bit handheld game console', '1998', 'Nintendo', 'from-purple-500 to-purple-600'),
  ('gba', 'Game Boy Advance', 'GBA', 'Gamepad2', '32-bit handheld game console', '2001', 'Nintendo', 'from-indigo-500 to-indigo-600'),
  ('game_gear', 'Sega Game Gear', 'GG', 'Gamepad2', '8-bit handheld game console', '1990', 'Sega', 'from-blue-400 to-blue-500'),
  ('lynx', 'Atari Lynx', 'Lynx', 'Gamepad2', '16-bit handheld game console', '1989', 'Atari', 'from-red-500 to-red-600'),
  ('wonderswan', 'WonderSwan', 'WS', 'Gamepad2', '16-bit handheld game console', '1999', 'Bandai', 'from-gray-500 to-gray-600'),
  ('ngp', 'Neo Geo Pocket', 'NGP', 'Gamepad2', '16-bit handheld game console', '1998', 'SNK', 'from-yellow-500 to-yellow-600')

ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  short_name = EXCLUDED.short_name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  year = EXCLUDED.year,
  manufacturer = EXCLUDED.manufacturer,
  gradient = EXCLUDED.gradient,
  updated_at = now();