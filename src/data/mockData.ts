import { Game } from '../types';

export const games: Game[] = [
  {
    id: 'smb-1',
    title: "Super Mario Bros.",
    system_id: 'nes',
    path: "/NES/USA/Super%20Mario%20Bros.%20(USA).nes",
    description: "The classic platformer where Mario saves Princess Peach.",
    cover_url: "https://images.launchbox-app.com/e078d459-a166-47a2-9b5a-26a9fd7cd924.jpg",
    favorite: true,
    release_year: '1985',
    developer: 'Nintendo',
    genre: 'Platformer'
  },
  {
    id: 'zelda-1',
    title: "The Legend of Zelda",
    system_id: 'nes',
    path: "/NES/USA/Legend%20of%20Zelda,%20The%20(USA)%20(Rev%201).nes",
    description: "Explore dungeons, solve puzzles, and defeat Ganon!",
    cover_url: "https://images.launchbox-app.com/cf17144e-91bb-4727-953b-905aa894644c.png",
    favorite: false,
    release_year: '1986',
    developer: 'Nintendo',
    genre: 'Action-Adventure'
  },
  
  {
    id: 'smw-1',
    title: "Super Mario World",
    system_id: 'snes',
    path: "/SNES/USA/Super%20Mario%20World%20(USA).sfc",
    description: "Join Mario and Yoshi in this epic adventure!",
    cover_url: "https://images.launchbox-app.com/1a175c33-1c72-4524-bc46-9f88b566cb16.jpg",
    favorite: true,
    release_year: '1990',
    developer: 'Nintendo',
    genre: 'Platformer'
  },
  {
    id: 'alttp-1',
    title: "The Legend of Zelda: A Link to the Past",
    system_id: 'snes',
    path: "/SNES/USA/Legend%20of%20Zelda,%20The%20-%20A%20Link%20to%20the%20Past%20(USA).sfc",
    description: "Help Link save Hyrule in this SNES classic.",
    cover_url: "https://images.launchbox-app.com/04cfaf16-9aa5-42da-b326-a43149b01f75.jpg",
    favorite: false,
    release_year: '1991',
    developer: 'Nintendo',
    genre: 'Action-Adventure'
  },

  {
    id: 'sonic-1',
    title: "Sonic the Hedgehog",
    system_id: 'genesis',
    path: "/Genesis/Sonic%20The%20Hedgehog%20(USA).md",
    description: "Speed through levels and stop Dr. Robotnik!",
    cover_url: "https://images.launchbox-app.com/f7f1fdbd-fc6f-430c-8a33-35516e01690c.png",
    favorite: true,
    release_year: '1991',
    developer: 'Sega',
    genre: 'Platformer'
  },
  {
    id: 'sor-1',
    title: "Streets of Rage",
    system_id: 'genesis',
    path: "/Genesis/Streets%20of%20Rage%202%20(USA).md",
    description: "Fight against crime in this beat 'em up classic.",
    cover_url: "https://images.launchbox-app.com/75e8efc5-67bb-4dd3-971f-2784dbb8529e.jpg",
    favorite: false,
    release_year: '1991',
    developer: 'Sega',
    genre: 'Beat-em-up'
  },

  {
    id: 'mgs-1',
    title: "Metal Gear Solid",
    system_id: 'psx',
    path: "/PSX/USA/Multi%20Disc%20(CHD)/Metal%20Gear%20Solid%20(USA)/Metal%20Gear%20Solid%20(USA)%20(Disc%201)%20(v1.1).chd",
    description: "Solid Snake must stop the terrorists at Shadow Moses.",
    cover_url: "https://images.launchbox-app.com/5e05d377-f292-41ec-a652-1b817ea2f7bb.jpg",
    favorite: true,
    release_year: '1998',
    developer: 'Konami',
    genre: 'Action-Adventure'
  },
  {
    id: 'crash-3',
    title: "Crash Bandicoot 3",
    system_id: 'psx',
    path: "/PSX/USA/Crash%20Bandicoot%20-%20Warped%20(USA).chd",
    description: "Gather all crystal by traveling back in different time periods and stop DR. Neo Cortex.",
    cover_url: "https://images.launchbox-app.com/62058421-e686-46b2-a731-4a7a401bfb07.jpg",
    favorite: false,
    release_year: '1998',
    developer: 'Naughty Dog',
    genre: 'Platformer'
  }
];