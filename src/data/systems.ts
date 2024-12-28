import { System } from '../types/system';

export const systems: System[] = [
  {
    id: 'nes',
    name: 'NES',
    shortName: 'NES',
    icon: 'Gamepad2',
    description: '8-bit home video game console',
    year: '1983',
    manufacturer: 'Nintendo',
    color: 'rgb(229, 62, 62)',
    gradient: 'from-red-500 to-red-600'
  },
  {
    id: 'snes',
    name: 'SNES',
    shortName: 'SNES',
    icon: 'Cpu',
    description: '16-bit home video game console',
    year: '1990',
    manufacturer: 'Nintendo',
    color: 'rgb(129, 140, 248)',
    gradient: 'from-indigo-400 to-indigo-500'
  },
  {
    id: 'genesis',
    name: 'Sega Genesis',
    shortName: 'Genesis',
    icon: 'Sword',
    description: '16-bit home video game console',
    year: '1988',
    manufacturer: 'Sega',
    color: 'rgb(34, 197, 94)',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'arcade',
    name: 'Arcade Systems',
    shortName: 'Arcade',
    icon: 'Joystick',
    description: 'Classic arcade systems',
    year: '1970s-1990s',
    manufacturer: 'Various',
    color: 'rgb(234, 179, 8)',
    gradient: 'from-yellow-500 to-yellow-600'
  }
];