/**
 * Default Character Skins and Presets
 */

import { CharacterSkin } from '../types/game';

export const DEFAULT_SKINS: CharacterSkin[] = [
  {
    id: 'desi_runner',
    name: 'Desi Runner (Aakash)',
    category: 'preset',
    description: 'Hero from the Godot reference: cool spectacles, blue sweatshirt, cargo pants, and leather boots.',
    primaryColor: '#2b5ea8', // Godot screenshot blue sweater/sweatshirt
    secondaryColor: '#52606d', // Grey/slate cargo pants
    hairColor: '#5c3826', // Swept brown hair
    accentColor: '#d6c8b4', // Beige collar zipper & cool glasses
    skinTone: '#e8b896', // Warm skin tone
    style: 'runner',
  },
  {
    id: 'meadow_runner',
    name: 'Meadow Sprinter',
    category: 'preset',
    description: 'Agile country racer equipped with aerodynamic tracksuit and wind scarf.',
    primaryColor: '#16a34a', // Emerald green
    secondaryColor: '#1e293b', // Slate navy pants
    hairColor: '#78350f', // Chestnut hair
    accentColor: '#ef4444', // Red scarf & headband
    skinTone: '#fcd34d',
    style: 'runner',
  },
  {
    id: 'rancher_cowboy',
    name: 'Pasture Rancher',
    category: 'preset',
    description: 'Seasoned cattle wrangler with classic ten-gallon hat and leather boots.',
    primaryColor: '#2563eb', // Denim blue shirt
    secondaryColor: '#451a03', // Ranch brown pants
    hairColor: '#451a03',
    accentColor: '#f59e0b', // Amber neckerchief & hat band
    skinTone: '#fed7aa',
    style: 'cowboy',
  },
  {
    id: 'cyber_dash',
    name: 'Neon Cyber-Dash',
    category: 'preset',
    description: 'High-velocity test runner wearing cybernetic visor and kinetic exoskeleton.',
    primaryColor: '#0f172a', // Matte black
    secondaryColor: '#0284c7', // Cyber blue
    hairColor: '#06b6d4',
    accentColor: '#06b6d4', // Glowing cyan visor
    skinTone: '#e2e8f0',
    style: 'cyber',
  },
  {
    id: 'calf_onesie',
    name: 'Pasture Calf',
    category: 'preset',
    description: 'Warm and adorable spotted cow onesie with mini horns and floppy ears.',
    primaryColor: '#f8fafc', // Spotted cow white
    secondaryColor: '#334155',
    hairColor: '#1e293b',
    accentColor: '#ec4899', // Pink muzzle & inner ears
    skinTone: '#fbcfe8',
    style: 'onesie',
  },
  {
    id: 'shinobi_ninja',
    name: 'Meadow Shinobi',
    category: 'preset',
    description: 'Silent shadow sprinter who leaps across pastures without rustling a leaf.',
    primaryColor: '#18181b', // Midnight black
    secondaryColor: '#27272a',
    hairColor: '#09090b',
    accentColor: '#dc2626', // Crimson sash
    skinTone: '#fef08a',
    style: 'ninja',
  },
];
